import React, { useState } from 'react';
import { Card, Row, Col, Switch, Form, Input, Button, Table, Tag, Alert, Timeline, Typography, Space, Tabs, Statistic } from 'antd';
import { SecurityScanOutlined, SafetyCertificateOutlined, SettingOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const XSSProtection: React.FC = () => {
  const [form] = Form.useForm();
  const [activeProtections, setActiveProtections] = useState({
    htmlEscape: true,
    csp: true,
    httpOnly: true,
    sanitizer: true,
  });

  // 模拟数据
  const protectionStats = {
    totalBlocked: 2547,
    activeRules: 15,
    lastAttack: '2025-02-14 10:30',
    effectiveness: 98.5,
  };

  const recentEvents = [
    { time: '2025-02-14 10:30', type: 'Reflected XSS', status: 'blocked', payload: '<script>alert(1)</script>' },
    { time: '2025-02-14 10:15', type: 'Stored XSS', status: 'blocked', payload: '<img src="x" onerror="alert(2)">' },
    { time: '2025-02-14 10:00', type: 'DOM XSS', status: 'detected', payload: 'javascript:alert(3)' },
  ];

  const protectionRules = [
    { key: '1', name: 'HTML转义', status: 'active', description: '对输入输出进行HTML实体编码' },
    { key: '2', name: 'CSP策略', status: 'active', description: '限制资源加载和内联脚本执行' },
    { key: '3', name: 'HttpOnly Cookie', status: 'active', description: '防止Cookie被JavaScript访问' },
    { key: '4', name: 'XSS过滤器', status: 'active', description: '过滤危险的HTML标签和属性' },
  ];

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
      <Title level={2}>XSS防护配置</Title>
      <Paragraph>
        本模块提供全面的XSS（跨站脚本）攻击防护机制，通过多层防御策略确保应用安全。
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* 防护状态统计 */}
        <Col span={6}>
          <Card>
            <Statistic
              title="已拦截攻击"
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

        {/* 防护配置面板 */}
        <Col span={24}>
          <Card title="防护配置" extra={<Button type="primary" icon={<SettingOutlined />}>保存配置</Button>}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="基础防护" key="1">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card type="inner" title="HTML转义">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.htmlEscape}
                          onChange={(checked) => handleProtectionChange('htmlEscape', checked)}
                        />
                        <Text>自动对用户输入进行HTML实体编码，防止XSS攻击</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card type="inner" title="CSP策略">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.csp}
                          onChange={(checked) => handleProtectionChange('csp', checked)}
                        />
                        <Text>启用内容安全策略，限制资源加载和脚本执行</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card type="inner" title="HttpOnly Cookie">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.httpOnly}
                          onChange={(checked) => handleProtectionChange('httpOnly', checked)}
                        />
                        <Text>设置Cookie的HttpOnly属性，防止JavaScript访问</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card type="inner" title="XSS过滤器">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.sanitizer}
                          onChange={(checked) => handleProtectionChange('sanitizer', checked)}
                        />
                        <Text>启用XSS过滤器，过滤危险的HTML标签和属性</Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="高级配置" key="2">
                <Form form={form} layout="vertical">
                  <Form.Item label="CSP策略配置" name="cspPolicy">
                    <Input.TextArea rows={4} placeholder="输入自定义的CSP策略" />
                  </Form.Item>
                  <Form.Item label="白名单域名" name="whitelist">
                    <Input.TextArea rows={4} placeholder="每行输入一个允许的域名" />
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
                    <Text code>{event.payload}</Text>
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

export default XSSProtection; 