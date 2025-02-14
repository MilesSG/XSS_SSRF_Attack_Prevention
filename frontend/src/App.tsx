import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import XSSAttack from './pages/XSSAttack';
import SSRFAttack from './pages/SSRFAttack';
import CombinedAttack from './pages/CombinedAttack';
import Navigation from './components/Navigation';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  return (
    <Router>
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ margin: '0 24px 0 0' }}>XSS与SSRF漏洞联合攻击实验平台</Title>
          <Navigation />
        </Header>
        <Content style={{ padding: '24px 50px' }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            <Routes>
              <Route path="/" element={
                <div>
                  <Title level={2}>欢迎使用XSS与SSRF漏洞联合攻击实验平台</Title>
                  <Typography.Paragraph>
                    本平台用于研究XSS漏洞与SSRF漏洞的联合攻击及其综合防范机制。您可以通过导航菜单访问不同的实验模块：
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    <ul>
                      <li>XSS攻击实验 - 演示和测试跨站脚本攻击</li>
                      <li>SSRF攻击实验 - 演示和测试服务器端请求伪造攻击</li>
                      <li>联合攻击实验 - 研究XSS与SSRF的组合攻击方式</li>
                      <li>防护机制 - 测试和验证各类防护措施的有效性</li>
                    </ul>
                  </Typography.Paragraph>
                </div>
              } />
              <Route path="/xss" element={<XSSAttack />} />
              <Route path="/ssrf" element={<SSRFAttack />} />
              <Route path="/combined" element={<CombinedAttack />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          XSS与SSRF漏洞联合攻击实验平台 ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Router>
  );
};

export default App; 