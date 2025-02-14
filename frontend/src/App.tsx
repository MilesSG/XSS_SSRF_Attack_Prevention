import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Typography, Row, Col, Card, Statistic, Progress, List, Timeline, Badge } from 'antd';
import { SecurityScanOutlined, BugOutlined, SafetyOutlined, RocketOutlined, 
  WarningOutlined, CheckCircleOutlined, ExperimentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import XSSAttack from './pages/XSSAttack';
import SSRFAttack from './pages/SSRFAttack';
import CombinedAttack from './pages/CombinedAttack';
import Navigation from './components/Navigation';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const App: React.FC = () => {
  // 模拟数据 - 实际项目中应该从后端API获取
  const stats = {
    totalAttacks: 1286,
    preventedAttacks: 1147,
    successRate: 89.2,
    activeThreats: 3,
  };

  const recentAttacks = [
    { type: 'XSS', time: '2024-03-21 14:23', status: 'prevented', severity: 'high' },
    { type: 'SSRF', time: '2024-03-21 13:45', status: 'detected', severity: 'medium' },
    { type: 'Combined', time: '2024-03-21 12:30', status: 'prevented', severity: 'critical' },
    { type: 'XSS', time: '2024-03-21 11:15', status: 'prevented', severity: 'low' },
  ];

  const securityScore = {
    xss: 92,
    ssrf: 88,
    combined: 85,
    overall: 90,
  };

  const quickLinks = [
    { title: 'XSS攻击实验', icon: <BugOutlined />, path: '/xss', color: '#1890ff' },
    { title: 'SSRF攻击实验', icon: <SecurityScanOutlined />, path: '/ssrf', color: '#52c41a' },
    { title: '联合攻击实验', icon: <ThunderboltOutlined />, path: '/combined', color: '#722ed1' },
    { title: '防护配置', icon: <SafetyOutlined />, path: '/settings', color: '#fa8c16' },
  ];

  return (
    <Router>
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ margin: '0 24px 0 0' }}>XSS与SSRF漏洞联合攻击实验平台</Title>
          <Navigation />
        </Header>
        <Content style={{ padding: '24px' }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            <Routes>
              <Route path="/" element={
                <div>
                  <Row gutter={[24, 24]}>
                    {/* 平台概览统计 */}
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="总攻击次数"
                          value={stats.totalAttacks}
                          prefix={<ExperimentOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="成功防护次数"
                          value={stats.preventedAttacks}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="防护成功率"
                          value={stats.successRate}
                          prefix={<SafetyOutlined />}
                          suffix="%"
                          precision={1}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="当前活跃威胁"
                          value={stats.activeThreats}
                          prefix={<WarningOutlined />}
                          valueStyle={{ color: '#cf1322' }}
                        />
                      </Card>
                    </Col>

                    {/* 安全评分 */}
                    <Col span={12}>
                      <Card title="安全防护评分" extra={<Text type="secondary">最近30天</Text>}>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Progress
                              type="circle"
                              percent={securityScore.overall}
                              format={percent => (
                                <div>
                                  <div style={{ fontSize: '24px', color: '#1890ff' }}>{percent}</div>
                                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>总体评分</div>
                                </div>
                              )}
                            />
                          </Col>
                          <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                              <Text>XSS防护评分</Text>
                              <Progress percent={securityScore.xss} size="small" />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <Text>SSRF防护评分</Text>
                              <Progress percent={securityScore.ssrf} size="small" />
                            </div>
                            <div>
                              <Text>联合攻击防护评分</Text>
                              <Progress percent={securityScore.combined} size="small" />
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>

                    {/* 最近攻击记录 */}
                    <Col span={12}>
                      <Card title="最近攻击记录" extra={<a href="#">查看全部</a>}>
                        <Timeline>
                          {recentAttacks.map((attack, index) => (
                            <Timeline.Item
                              key={index}
                              color={attack.status === 'prevented' ? 'green' : 'blue'}
                              dot={attack.status === 'prevented' ? <CheckCircleOutlined /> : <WarningOutlined />}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>
                                  <Badge
                                    status={
                                      attack.severity === 'critical' ? 'error' :
                                      attack.severity === 'high' ? 'warning' :
                                      attack.severity === 'medium' ? 'processing' : 'success'
                                    }
                                  />
                                  {attack.type}攻击
                                </span>
                                <Text type="secondary">{attack.time}</Text>
                              </div>
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      </Card>
                    </Col>

                    {/* 快速入口 */}
                    <Col span={24}>
                      <Card title="快速入口">
                        <Row gutter={[16, 16]}>
                          {quickLinks.map((link, index) => (
                            <Col span={6} key={index}>
                              <Card
                                hoverable
                                style={{ textAlign: 'center', borderLeft: `2px solid ${link.color}` }}
                                onClick={() => window.location.href = link.path}
                              >
                                <div style={{ fontSize: '24px', color: link.color, marginBottom: '8px' }}>
                                  {link.icon}
                                </div>
                                <div>{link.title}</div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </Card>
                    </Col>

                    {/* 平台介绍 */}
                    <Col span={24}>
                      <Card title="平台介绍">
                        <Paragraph>
                          本平台是一个专业的Web安全漏洞研究环境，专注于XSS（跨站脚本）和SSRF（服务器端请求伪造）漏洞的攻防研究。
                          平台提供了独立的漏洞测试环境和联合攻击测试场景，并实现了完整的防护机制。
                        </Paragraph>
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Card type="inner" title="XSS攻击实验">
                              <ul>
                                <li>反射型XSS测试</li>
                                <li>存储型XSS测试</li>
                                <li>DOM型XSS测试</li>
                                <li>XSS攻击防护演示</li>
                              </ul>
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card type="inner" title="SSRF攻击实验">
                              <ul>
                                <li>基础SSRF漏洞测试</li>
                                <li>协议解析漏洞测试</li>
                                <li>重定向漏洞测试</li>
                                <li>SSRF防护策略演示</li>
                              </ul>
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card type="inner" title="联合攻击实验">
                              <ul>
                                <li>XSS+SSRF组合攻击</li>
                                <li>攻击链路分析</li>
                                <li>漏洞相关性研究</li>
                                <li>综合防护方案演示</li>
                              </ul>
                            </Card>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </div>
              } />
              <Route path="/xss" element={<XSSAttack />} />
              <Route path="/ssrf" element={<SSRFAttack />} />
              <Route path="/combined" element={<CombinedAttack />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          XSS与SSRF漏洞联合攻击实验平台 ©{new Date().getFullYear()} Created by MilesSG
        </Footer>
      </Layout>
    </Router>
  );
};

export default App; 