import React, { useState } from 'react';
import { Card, Row, Col, Switch, Form, Input, Button, Table, Tag, Alert, Timeline, Typography, Space, Tabs, Statistic, Select, Progress } from 'antd';
import { SecurityScanOutlined, SafetyCertificateOutlined, SettingOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, LinkOutlined, RadarChartOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const CombinedProtection: React.FC = () => {
  const [form] = Form.useForm();
  const [activeProtections, setActiveProtections] = useState({
    xssProtection: true,
    ssrfProtection: true,
    chainAnalysis: true,
    realTimeMonitoring: true,
  });

  // 模拟数据
  const protectionStats = {
    totalBlocked: 856,
    activeRules: 18,
    lastAttack: '2025-02-14 12:15',
    effectiveness: 99.2,
  };

  const recentEvents = [
    { time: '2025-02-14 12:15', type: 'XSS+SSRF', status: 'blocked', details: 'XSS注入 -> SSRF请求内网服务' },
    { time: '2025-02-14 12:00', type: 'XSS链式', status: 'blocked', details: 'DOM XSS -> 存储型XSS' },
    { time: '2025-02-14 11:45', type: 'SSRF链式', status: 'detected', details: 'URL重定向 -> 协议利用' },
  ];

  const protectionRules = [
    { key: '1', name: 'XSS防护链', status: 'active', description: '多层XSS防护机制联动' },
    { key: '2', name: 'SSRF防护链', status: 'active', description: '多层SSRF防护机制联动' },
    { key: '3', name: '攻击链分析', status: 'active', description: '实时分析攻击链路特征' },
    { key: '4', name: '联合防护', status: 'active', description: '协同防护策略联动' },
  ];

  const securityMetrics = {
    xss: {
      score: 95,
      details: {
        input: 98,
        output: 96,
        dom: 92,
      }
    },
    ssrf: {
      score: 94,
      details: {
        url: 95,
        protocol: 93,
        redirect: 94,
      }
    },
    combined: {
      score: 97,
      details: {
        chain: 96,
        realtime: 98,
        prevention: 97,
      }
    }
  };

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '已启用' : '已禁用'}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>编辑</a>
          <a>配置</a>
        </Space>
      ),
    },
  ];

  const handleProtectionChange = (type: string, checked: boolean) => {
    setActiveProtections(prev => ({
      ...prev,
      [type]: checked,
    }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>综合防护配置</Title>
      <Paragraph>
        本模块提供XSS与SSRF漏洞的联合防护机制，通过多层协同防御策略和实时攻击链分析，提供更全面的安全保护。
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* 防护状态统计 */}
        <Col span={6}>
          <Card>
            <Statistic
              title="已拦截联合攻击"
              value={protectionStats.totalBlocked}
              prefix={<SecurityScanOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃规则"
              value={protectionStats.activeRules}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="防护有效率"
              value={protectionStats.effectiveness}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最近攻击"
              value={protectionStats.lastAttack}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>

        {/* 安全评分面板 */}
        <Col span={24}>
          <Card title="安全评分" extra={<Text type="secondary">实时更新</Text>}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card type="inner" title="XSS防护评分">
                  <Progress type="circle" percent={securityMetrics.xss.score} />
                  <div style={{ marginTop: 16 }}>
                    <Progress size="small" percent={securityMetrics.xss.details.input} format={() => '输入过滤'} />
                    <Progress size="small" percent={securityMetrics.xss.details.output} format={() => '输出编码'} />
                    <Progress size="small" percent={securityMetrics.xss.details.dom} format={() => 'DOM防护'} />
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" title="SSRF防护评分">
                  <Progress type="circle" percent={securityMetrics.ssrf.score} />
                  <div style={{ marginTop: 16 }}>
                    <Progress size="small" percent={securityMetrics.ssrf.details.url} format={() => 'URL验证'} />
                    <Progress size="small" percent={securityMetrics.ssrf.details.protocol} format={() => '协议控制'} />
                    <Progress size="small" percent={securityMetrics.ssrf.details.redirect} format={() => '重定向防护'} />
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" title="联合防护评分">
                  <Progress type="circle" percent={securityMetrics.combined.score} />
                  <div style={{ marginTop: 16 }}>
                    <Progress size="small" percent={securityMetrics.combined.details.chain} format={() => '链路分析'} />
                    <Progress size="small" percent={securityMetrics.combined.details.realtime} format={() => '实时监控'} />
                    <Progress size="small" percent={securityMetrics.combined.details.prevention} format={() => '预防效果'} />
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 防护配置面板 */}
        <Col span={24}>
          <Card title="防护配置" extra={<Button type="primary" icon={<SettingOutlined />}>保存配置</Button>}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="基础防护" key="1">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card type="inner" title="XSS防护">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.xssProtection}
                          onChange={(checked) => handleProtectionChange('xssProtection', checked)}
                        />
                        <Text>启用XSS漏洞防护机制</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card type="inner" title="SSRF防护">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.ssrfProtection}
                          onChange={(checked) => handleProtectionChange('ssrfProtection', checked)}
                        />
                        <Text>启用SSRF漏洞防护机制</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card type="inner" title="攻击链分析">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.chainAnalysis}
                          onChange={(checked) => handleProtectionChange('chainAnalysis', checked)}
                        />
                        <Text>启用攻击链路实时分析</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card type="inner" title="实时监控">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.realTimeMonitoring}
                          onChange={(checked) => handleProtectionChange('realTimeMonitoring', checked)}
                        />
                        <Text>启用实时安全监控</Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="高级配置" key="2">
                <Form form={form} layout="vertical">
                  <Form.Item label="联合防护策略" name="combinedStrategy">
                    <Select mode="multiple" placeholder="选择联合防护策略">
                      <Option value="chain">攻击链分析</Option>
                      <Option value="correlation">关联性分析</Option>
                      <Option value="behavior">行为特征分析</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="监控配置" name="monitoringConfig">
                    <Input.TextArea rows={4} placeholder="配置监控参数" />
                  </Form.Item>
                  <Form.Item label="防护阈值" name="thresholds">
                    <Input.TextArea rows={4} placeholder="设置防护阈值参数" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary">保存高级配置</Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* 防护规则列表 */}
        <Col span={24}>
          <Card title="防护规则">
            <Table columns={columns} dataSource={protectionRules} />
          </Card>
        </Col>

        {/* 最近防护事件 */}
        <Col span={24}>
          <Card title="最近防护事件">
            <Timeline>
              {recentEvents.map((event, index) => (
                <Timeline.Item
                  key={index}
                  color={event.status === 'blocked' ? 'green' : 'blue'}
                  dot={event.status === 'blocked' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                  <p>
                    <Text strong>{event.time}</Text> - {event.type}
                    <Tag color={event.status === 'blocked' ? 'success' : 'processing'} style={{ marginLeft: 8 }}>
                      {event.status}
                    </Tag>
                  </p>
                  <p>
                    <Text code>{event.details}</Text>
                  </p>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CombinedProtection; 