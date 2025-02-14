import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  BugOutlined,
  SecurityScanOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表盘</Link>
    },
    {
      key: '/xss',
      icon: <BugOutlined />,
      label: <Link to="/xss">XSS攻击</Link>
    },
    {
      key: '/ssrf',
      icon: <SecurityScanOutlined />,
      label: <Link to="/ssrf">SSRF攻击</Link>
    },
    {
      key: '/combined',
      icon: <BarChartOutlined />,
      label: <Link to="/combined">联合攻击</Link>
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">设置</Link>
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0, background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ float: 'left', width: 200, height: 64, padding: '0 24px' }}>
          <h1 style={{ margin: 0, lineHeight: '64px', fontSize: '18px' }}>
            攻击实验平台
          </h1>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: '4px'
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 