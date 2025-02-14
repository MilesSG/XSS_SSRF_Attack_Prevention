import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Divider, Tag, Row, Col, Progress, Timeline, Descriptions, Badge } from 'antd';
import { CodeOutlined, ExperimentOutlined, BugOutlined, SafetyOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

const XSSAttack: React.FC = () => {
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); // 用于强制刷新预览
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const testCases = [
    {
      name: '基础弹窗测试',
      payload: `
        <div id="xss-result"></div>
        <script>
          const result = document.getElementById('xss-result');
          result.innerHTML = '<div class="alert-box">XSS攻击成功！</div>';
          result.style.backgroundColor = '#f6ffed';
          result.style.border = '1px solid #b7eb8f';
          result.style.padding = '10px';
          result.style.borderRadius = '4px';
          result.style.marginBottom = '10px';
        </script>`,
      description: '最基本的XSS测试，验证是否可以执行JavaScript',
      risk: 'low',
      category: 'DOM-XSS'
    },
    {
      name: 'Cookie获取',
      payload: `
        <div id="cookie-result"></div>
        <script>
          const cookieResult = document.getElementById('cookie-result');
          cookieResult.innerHTML = '<div class="alert-box">获取到的Cookie信息：<br/>' + 
            '<pre style="background:#f5f5f5;padding:10px;margin-top:5px;border-radius:4px;word-break:break-all;">' + 
            document.cookie + '</pre></div>';
          cookieResult.style.backgroundColor = '#fff2f0';
          cookieResult.style.border = '1px solid #ffccc7';
          cookieResult.style.padding = '10px';
          cookieResult.style.borderRadius = '4px';
          cookieResult.style.marginBottom = '10px';
        </script>`,
      description: '获取并显示当前页面的cookie信息',
      risk: 'high',
      category: '反射型XSS'
    },
    {
      name: 'DOM操作',
      payload: `
        <div id="dom-result"></div>
        <script>
          document.body.style.backgroundColor = "#fff2e8";
          const domResult = document.getElementById('dom-result');
          domResult.innerHTML = '<div class="alert-box" style="color:white;background:#ff4d4f;padding:15px;border-radius:4px;">' +
            '<h3 style="margin:0">页面已被XSS攻击修改！</h3>' +
            '<p style="margin:5px 0 0">背景颜色和DOM结构已被改变</p></div>';
        </script>`,
      description: '修改页面样式和内容，演示DOM操作能力',
      risk: 'medium',
      category: 'DOM-XSS'
    },
    {
      name: '图片标签触发',
      payload: `
        <div id="img-result"></div>
        <img src="x" onerror="
          const imgResult = document.getElementById('img-result');
          imgResult.innerHTML = '<div class=\\'alert-box\\'>通过图片标签触发XSS攻击成功！</div>';
          imgResult.style.backgroundColor = '#e6f7ff';
          imgResult.style.border = '1px solid #91d5ff';
          imgResult.style.padding = '10px';
          imgResult.style.borderRadius = '4px';
          imgResult.style.marginBottom = '10px';
        " style="display:none">`,
      description: '通过图片加载失败触发XSS',
      risk: 'low',
      category: '存储型XSS'
    },
    {
      name: '键盘事件',
      payload: `
        <div id="keyboard-result" tabindex="0" style="padding:15px;background:#f0f0f0;border-radius:4px;cursor:pointer">
          点击此区域并按任意键触发攻击
        </div>
        <script>
          const keyboardResult = document.getElementById('keyboard-result');
          keyboardResult.onkeypress = function() {
            this.innerHTML = '<div class="alert-box" style="background:#d9f7be;padding:10px;border-radius:4px;">' +
              '键盘事件触发XSS攻击成功！<br/>' +
              '<small style="color:#666">按下的按键触发了事件处理器</small></div>';
          };
          keyboardResult.focus();
        </script>`,
      description: '通过键盘事件触发XSS',
      risk: 'medium',
      category: 'DOM-XSS'
    }
  ];

  // 监听payload变化，更新预览
  useEffect(() => {
    updatePreview();
  }, [payload]);

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
              <title>XSS攻击效果预览</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px;
                  margin: 0;
                  background-color: #f5f5f5;
                  transition: all 0.3s;
                }
                .preview-content { 
                  border: 1px solid #eee;
                  padding: 15px;
                  background: white;
                  border-radius: 4px;
                  min-height: 100px;
                  margin-bottom: 10px;
                }
                .preview-header {
                  background: #1890ff;
                  color: white;
                  padding: 10px;
                  margin: -20px -20px 20px -20px;
                  font-weight: bold;
                }
                .alert-box {
                  animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                pre {
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
                .log-container {
                  margin-top: 15px;
                  padding: 10px;
                  background: #f8f9fa;
                  border-radius: 4px;
                  font-family: monospace;
                }
                .log-entry {
                  margin: 5px 0;
                  padding: 5px;
                  border-left: 3px solid #1890ff;
                  background: white;
                }
              </style>
            </head>
            <body>
              <div class="preview-header">实时预览区域</div>
              <div class="preview-content">
                ${payload || '<div style="color: #999; text-align: center;">在此处显示XSS攻击效果</div>'}
              </div>
              <div class="log-container">
                <div class="log-entry">执行时间：${new Date().toLocaleString()}</div>
                <div class="log-entry">载荷长度：${payload.length} 字符</div>
                <div class="log-entry">包含标签：${(payload.match(/<[^>]+>/g) || []).length} 个</div>
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
      const response = await fetch('http://localhost:5000/api/attacks/xss/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      });
      const data = await response.json();
      
      // 增强分析报告内容
      const enhancedData = {
        ...data,
        analysis: {
          type: getXSSType(payload),
          riskLevel: getRiskLevel(getPayloadRiskLevel(payload)),
          impactScope: getImpactScope(payload),
          preventionMethods: getPreventionMethods(payload),
          technicalDetails: analyzeTechnicalDetails(payload)
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

  const getXSSType = (payload: string): string => {
    if (payload.includes('document.cookie')) return '反射型XSS - 信息窃取';
    if (payload.includes('document.body')) return 'DOM型XSS - 页面修改';
    if (payload.includes('img')) return '存储型XSS - 标签注入';
    if (payload.includes('script')) return '基础XSS - 脚本执行';
    return '未知类型';
  };

  const getPayloadRiskLevel = (payload: string): string => {
    if (payload.includes('cookie') || payload.includes('localStorage')) return 'high';
    if (payload.includes('document.body') || payload.includes('innerHTML')) return 'medium';
    return 'low';
  };

  const getImpactScope = (payload: string): string => {
    if (payload.includes('cookie')) return '用户会话信息泄露';
    if (payload.includes('document.body')) return '页面结构破坏';
    if (payload.includes('alert')) return '用户界面干扰';
    return '潜在的安全威胁';
  };

  const getPreventionMethods = (payload: string): string[] => {
    const methods = [
      'Content-Security-Policy (CSP) 配置',
      'HttpOnly Cookie 标记',
      '输入数据验证和过滤',
      'XSS防护库的使用'
    ];
    if (payload.includes('script')) {
      methods.push('移除或转义script标签');
    }
    if (payload.includes('img')) {
      methods.push('图片标签src属性验证');
    }
    return methods;
  };

  const analyzeTechnicalDetails = (payload: string): string => {
    const details = [];
    if (payload.includes('script')) {
      details.push('检测到脚本标签注入');
    }
    if (payload.includes('img')) {
      details.push('检测到图片标签事件处理器注入');
    }
    if (payload.includes('document')) {
      details.push('检测到DOM操作尝试');
    }
    if (payload.includes('cookie')) {
      details.push('检测到Cookie访问尝试');
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
      <Title level={2}>XSS攻击实验</Title>
      <Paragraph>
        本实验模块用于演示和测试跨站脚本(XSS)攻击。XSS攻击允许攻击者将恶意脚本注入到网页中，
        从而在其他用户的浏览器中执行。
      </Paragraph>

      <Row gutter={24}>
        <Col span={12}>
          <Card title={<><CodeOutlined /> 攻击载荷配置</>}>
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
                    onClick={() => setPayload(test.payload)}
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
              
              <Text strong>输入XSS攻击载荷：</Text>
              <TextArea
                rows={4}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="例如：<script>alert('XSS')</script>"
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
            title={<><BugOutlined /> 攻击效果预览</>}
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
                description="以下区域将实时显示XSS攻击的效果，请注意观察页面变化。"
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
              sandbox="allow-scripts allow-same-origin"
              title="XSS攻击效果预览"
            />
          </Card>

          {result && (
            <Card 
              title={<><SafetyOutlined /> 攻击分析报告</>} 
              style={{ marginTop: 24 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message={result.success ? "攻击执行成功" : "攻击执行失败"}
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

export default XSSAttack; 