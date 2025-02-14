import React, { useState } from 'react';
import { Card, Row, Col, Switch, Form, Input, Button, Table, Tag, Alert, Timeline, Typography, Space, Tabs, Statistic, Select } from 'antd';
import { SecurityScanOutlined, SafetyCertificateOutlined, SettingOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SSRFProtection: React.FC = () => {
  const [form] = Form.useForm();
  const [activeProtections, setActiveProtections] = useState({
    urlValidation: true,
    ipRestriction: true,
    protocolFilter: true,
    redirectValidation: true,
  });

  // 模拟数据
  const protectionStats = {
    totalBlocked: 1358,
    activeRules: 12,
    lastAttack: '2024-03-21 16:45',
    effectiveness: 97.8,
  };

  const recentEvents = [
    { time: '2024-03-21 16:45', type: '内网访问', status: 'blocked', target: 'http://192.168.1.1/admin' },
    { time: '2024-03-21 16:30', type: '协议滥用', status: 'blocked', target: 'file:///etc/passwd' },
    { time: '2024-03-21 16:15', type: '重定向攻击', status: 'detected', target: 'http://example.com/redirect?url=http://internal-service' },
  ];

  const protectionRules = [
    { key: '1', name: 'URL白名单', status: 'active', description: '限制请求只能访问白名单中的URL' },
    { key: '2', name: 'IP限制', status: 'active', description: '禁止访问内网IP地址' },
    { key: '3', name: '协议过滤', status: 'active', description: '限制允许使用的协议类型' },
    { key: '4', name: '重定向验证', status: 'active', description: '验证重定向地址的安全性' },
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
      <Title level={2}>SSRF防护配置</Title>
      <Paragraph>
        本模块提供全面的SSRF（服务器端请求伪造）攻击防护机制，通过多层防御策略确保服务器安全。
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
                    <Card type="inner" title="URL验证">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.urlValidation}
                          onChange={(checked) => handleProtectionChange('urlValidation', checked)}
                        />
                        <Text>验证请求URL的合法性，防止恶意请求</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card type="inner" title="IP限制">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.ipRestriction}
                          onChange={(checked) => handleProtectionChange('ipRestriction', checked)}
                        />
                        <Text>限制对内网IP的访问请求</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card type="inner" title="协议过滤">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.protocolFilter}
                          onChange={(checked) => handleProtectionChange('protocolFilter', checked)}
                        />
                        <Text>限制允许使用的协议类型</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card type="inner" title="重定向验证">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={activeProtections.redirectValidation}
                          onChange={(checked) => handleProtectionChange('redirectValidation', checked)}
                        />
                        <Text>验证重定向地址的安全性</Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="高级配置" key="2">
                <Form form={form} layout="vertical">
                  <Form.Item label="允许的协议" name="allowedProtocols">
                    <Select mode="multiple" placeholder="选择允许的协议">
                      <Option value="http">HTTP</Option>
                      <Option value="https">HTTPS</Option>
                      <Option value="ftp">FTP</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="IP白名单" name="ipWhitelist">
                    <Input.TextArea rows={4} placeholder="每行输入一个允许访问的IP地址或网段" />
                  </Form.Item>
                  <Form.Item label="域名白名单" name="domainWhitelist">
                    <Input.TextArea rows={4} placeholder="每行输入一个允许访问的域名" />
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
                    <Text code>{event.target}</Text>
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

export default SSRFProtection; 