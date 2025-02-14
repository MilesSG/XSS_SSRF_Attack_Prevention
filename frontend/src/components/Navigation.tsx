import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { ExperimentOutlined, SecurityScanOutlined, DashboardOutlined } from '@ant-design/icons';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      selectedKeys={[location.pathname]}
      style={{ lineHeight: '64px' }}
    >
      <Menu.Item key="/" icon={<DashboardOutlined />}>
        <Link to="/">首页</Link>
      </Menu.Item>
      <Menu.SubMenu key="attacks" icon={<ExperimentOutlined />} title="攻击实验">
        <Menu.Item key="/xss">
          <Link to="/xss">XSS攻击实验</Link>
        </Menu.Item>
        <Menu.Item key="/ssrf">
          <Link to="/ssrf">SSRF攻击实验</Link>
        </Menu.Item>
        <Menu.Item key="/combined">
          <Link to="/combined">联合攻击实验</Link>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu key="defense" icon={<SecurityScanOutlined />} title="防护机制">
        <Menu.Item key="/defense/xss">
          <Link to="/defense/xss">XSS防护</Link>
        </Menu.Item>
        <Menu.Item key="/defense/ssrf">
          <Link to="/defense/ssrf">SSRF防护</Link>
        </Menu.Item>
        <Menu.Item key="/defense/combined">
          <Link to="/defense/combined">综合防护</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default Navigation; 