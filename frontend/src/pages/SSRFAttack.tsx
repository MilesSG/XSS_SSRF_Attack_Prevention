import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Divider, Tag, Row, Col, Progress, Timeline, Descriptions, Badge } from 'antd';
import { LinkOutlined, ExperimentOutlined, BugOutlined, SafetyOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

const SSRFAttack: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const testCases = [
    {
      name: '本地文件访问',
      targetUrl: 'file:///etc/passwd',
      payload: '',
      description: '尝试读取服务器本地文件',
      risk: 'high',
      category: '文件读取'
    },
    {
      name: '内网端口扫描',
      targetUrl: 'http://127.0.0.1:22',
      payload: '',
      description: '扫描内网主机开放端口',
      risk: 'high',
      category: '内网探测'
    },
    {
      name: '内网服务访问',
      targetUrl: 'http://192.168.1.1',
      payload: '',
      description: '访问内网服务和资源',
      risk: 'medium',
      category: '服务访问'
    },
    {
      name: 'DNS重绑定',
      targetUrl: 'http://attacker-controlled-domain.com',
      payload: '{"type": "dns-rebinding"}',
      description: '利用DNS重绑定绕过同源策略',
      risk: 'high',
      category: 'DNS攻击'
    },
    {
      name: '协议篡改',
      targetUrl: 'gopher://127.0.0.1:6379/_FLUSHALL',
      payload: '',
      description: '利用其他协议访问内部服务',
      risk: 'high',
      category: '协议利用'
    }
  ];

  useEffect(() => {
    updatePreview();
  }, [targetUrl, payload]);

  const updatePreview = () => {
    if (previewFrameRef.current) {
      const frame = previewFrameRef.current;
      const frameDoc = frame.contentDocument || frame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>SSRF攻击请求预览</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px;
                  margin: 0;
                  background-color: #f5f5f5;
                }
                .preview-content { 
                  border: 1px solid #eee;
                  padding: 15px;
                  background: white;
                  border-radius: 4px;
                  margin-bottom: 10px;
                }
                .preview-header {
                  background: #1890ff;
                  color: white;
                  padding: 10px;
                  margin: -20px -20px 20px -20px;
                  font-weight: bold;
                }
                .request-details {
                  background: #f8f9fa;
                  padding: 10px;
                  border-radius: 4px;
                  font-family: monospace;
                  margin-top: 10px;
                }
                .url-display {
                  word-break: break-all;
                  padding: 8px;
                  background: #e6f7ff;
                  border: 1px solid #91d5ff;
                  border-radius: 4px;
                  margin: 10px 0;
                }
              </style>
            </head>
            <body>
              <div class="preview-header">请求预览</div>
              <div class="preview-content">
                <h3>目标URL：</h3>
                <div class="url-display">${targetUrl || '未设置'}</div>
                
                <h3>请求载荷：</h3>
                <pre class="request-details">${payload || '未设置'}</pre>
                
                <div class="request-details">
                  <div>请求方法：POST</div>
                  <div>Content-Type: application/json</div>
                  <div>发起时间：${new Date().toLocaleString()}</div>
                </div>
              </div>
            </body>
          </html>
        `);
        frameDoc.close();
      }
    }
    setPreviewKey(prev => prev + 1);
  };

  const handleAttack = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/attacks/ssrf/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUrl, payload }),
      });
      const data = await response.json();
      
      // 增强分析报告内容
      const enhancedData = {
        ...data,
        analysis: {
          type: getSSRFType(targetUrl),
          riskLevel: getRiskLevel(getPayloadRiskLevel(targetUrl)),
          impactScope: getImpactScope(targetUrl),
          preventionMethods: getPreventionMethods(targetUrl),
          technicalDetails: analyzeTechnicalDetails(targetUrl, payload)
        }
      };
      
      setResult(enhancedData);
    } catch (error) {
      setResult({ 
        success: false, 
        error: (error as Error).message,
        analysis: {
          type: '分析失败',
          riskLevel: { color: '#ff4d4f', percent: 0 },
          impactScope: '未知',
          preventionMethods: ['无法分析预防方法'],
          technicalDetails: '分析过程发生错误'
        }
      });
    }
    setLoading(false);
  };

  const getSSRFType = (url: string): string => {
    if (url.startsWith('file:')) return '文件读取型SSRF';
    if (url.includes('127.0.0.1') || url.includes('localhost')) return '内网访问型SSRF';
    if (url.startsWith('gopher:') || url.startsWith('dict:')) return '协议利用型SSRF';
    return '标准SSRF请求';
  };

  const getPayloadRiskLevel = (url: string): string => {
    if (url.startsWith('file:') || url.includes('127.0.0.1')) return 'high';
    if (url.match(/192\.168\.|172\.|10\./)) return 'medium';
    return 'low';
  };

  const getImpactScope = (url: string): string => {
    if (url.startsWith('file:')) return '服务器文件系统泄露';
    if (url.includes('127.0.0.1')) return '内网服务暴露';
    if (url.match(/192\.168\.|172\.|10\./)) return '内网资源访问';
    return '外部服务请求';
  };

  const getPreventionMethods = (url: string): string[] => {
    const methods = [
      'URL白名单校验',
      '禁用危险协议',
      '限制请求端口',
      '配置网络隔离'
    ];
    if (url.startsWith('file:')) {
      methods.push('禁用文件协议');
    }
    if (url.includes('127.0.0.1')) {
      methods.push('禁止访问内网地址');
    }
    return methods;
  };

  const analyzeTechnicalDetails = (url: string, payload: string): string => {
    const details = [];
    if (url.startsWith('file:')) {
      details.push('尝试文件协议访问');
    }
    if (url.includes('127.0.0.1') || url.match(/192\.168\.|172\.|10\./)) {
      details.push('尝试内网地址访问');
    }
    if (url.match(/:\d+/)) {
      details.push('指定端口访问');
    }
    if (payload) {
      details.push('包含自定义请求载荷');
    }
    return details.join('、');
  };

  const getRiskLevel = (risk: string) => {
    switch (risk) {
      case 'high': return { color: '#ff4d4f', percent: 100 };
      case 'medium': return { color: '#faad14', percent: 65 };
      case 'low': return { color: '#52c41a', percent: 30 };
      default: return { color: '#1890ff', percent: 50 };
    }
  };

  return (
    <div>
      <Title level={2}>SSRF攻击实验</Title>
      <Paragraph>
        本实验模块用于演示和测试服务器端请求伪造(SSRF)攻击。SSRF攻击允许攻击者从服务器发起恶意的网络请求，
        从而可能访问内部网络资源或绕过访问控制。
      </Paragraph>

      <Row gutter={24}>
        <Col span={12}>
          <Card title={<><LinkOutlined /> 攻击载荷配置</>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="安全提示"
                description="本实验环境仅供安全研究和学习使用，请勿在未授权的系统上进行测试。"
                type="warning"
                showIcon
              />
              <Divider />
              
              <Text strong>预设测试用例：</Text>
              <Space wrap>
                {testCases.map((test, index) => (
                  <Tag
                    key={index}
                    color={getRiskLevel(test.risk).color}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setTargetUrl(test.targetUrl);
                      setPayload(test.payload);
                    }}
                  >
                    {test.name}
                    <Progress 
                      percent={getRiskLevel(test.risk).percent} 
                      size="small" 
                      showInfo={false}
                      strokeColor={getRiskLevel(test.risk).color}
                      style={{ width: 50, marginLeft: 10 }}
                    />
                  </Tag>
                ))}
              </Space>
              
              <Divider />
              
              <Text strong>目标URL：</Text>
              <Input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="例如：http://internal-api.example.com"
              />

              <Text strong>SSRF载荷：</Text>
              <TextArea
                rows={4}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="输入SSRF攻击载荷（JSON格式）"
              />
              
              <Button 
                type="primary" 
                onClick={handleAttack}
                loading={loading}
                icon={<ExperimentOutlined />}
                danger
              >
                执行攻击
              </Button>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card 
            title={<><BugOutlined /> 请求预览</>}
            extra={
              <Button 
                type="link" 
                icon={<ExperimentOutlined />}
                onClick={updatePreview}
              >
                刷新预览
              </Button>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Alert
                message="预览区域"
                description="以下区域将显示SSRF请求的详细信息，包括目标URL和请求载荷。"
                type="info"
                showIcon
              />
            </div>
            <iframe
              key={previewKey}
              ref={previewFrameRef}
              style={{
                width: '100%',
                height: '300px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }}
              sandbox="allow-same-origin"
              title="SSRF请求预览"
            />
          </Card>

          {result && (
            <Card 
              title={<><SafetyOutlined /> 攻击分析报告</>} 
              style={{ marginTop: 24 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message={result.success ? "请求执行成功" : "请求执行失败"}
                  type={result.success ? "success" : "error"}
                  showIcon
                  icon={result.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                />

                <Descriptions
                  title="攻击详情分析"
                  bordered
                  column={1}
                  size="small"
                >
                  <Descriptions.Item label="攻击类型">
                    <Badge status={result.success ? "processing" : "default"} text={result.analysis.type} />
                  </Descriptions.Item>
                  <Descriptions.Item label="风险等级">
                    <Progress
                      percent={result.analysis.riskLevel.percent}
                      size="small"
                      status={result.success ? "active" : "exception"}
                      strokeColor={result.analysis.riskLevel.color}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="影响范围">
                    {result.analysis.impactScope}
                  </Descriptions.Item>
                  <Descriptions.Item label="技术细节">
                    {result.analysis.technicalDetails}
                  </Descriptions.Item>
                </Descriptions>

                <Card
                  type="inner"
                  title="防护建议"
                  size="small"
                >
                  <Timeline>
                    {result.analysis.preventionMethods.map((method: string, index: number) => (
                      <Timeline.Item 
                        key={index}
                        color="blue"
                      >
                        {method}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default SSRFAttack; 