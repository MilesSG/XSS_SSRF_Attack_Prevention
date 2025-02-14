import React, { useState } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Divider } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const XSSAttack: React.FC = () => {
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('攻击执行失败：' + (error as Error).message);
    }
    setLoading(false);
  };

  return (
    <div>
      <Title level={2}>XSS攻击实验</Title>
      <Paragraph>
        本实验模块用于演示和测试跨站脚本(XSS)攻击。XSS攻击允许攻击者将恶意脚本注入到网页中，
        从而在其他用户的浏览器中执行。
      </Paragraph>

      <Card title="攻击载荷配置" extra={<CodeOutlined />}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="安全提示"
            description="本实验环境仅供安全研究和学习使用，请勿在未授权的系统上进行测试。"
            type="warning"
            showIcon
          />
          <Divider />
          
          <Typography.Text strong>输入XSS攻击载荷：</Typography.Text>
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
          >
            执行攻击
          </Button>

          {result && (
            <>
              <Divider />
              <Typography.Text strong>攻击结果：</Typography.Text>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '4px' 
              }}>
                {result}
              </pre>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default XSSAttack; 