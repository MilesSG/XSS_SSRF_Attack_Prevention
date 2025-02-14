import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { ExperimentOutlined, SecurityScanOutlined, DashboardOutlined, ThunderboltOutlined, SafetyOutlined } from '@ant-design/icons';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      selectedKeys={[location.pathname]}
      style={{ lineHeight: '64px', flex: 1 }}
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
      <Menu.SubMenu key="protection" icon={<SafetyOutlined />} title="防护机制">
        <Menu.Item key="/protection/xss">
          <Link to="/protection/xss">XSS防护</Link>
        </Menu.Item>
        <Menu.Item key="/protection/ssrf">
          <Link to="/protection/ssrf">SSRF防护</Link>
        </Menu.Item>
        <Menu.Item key="/protection/combined">
          <Link to="/protection/combined">综合防护</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default Navigation; 