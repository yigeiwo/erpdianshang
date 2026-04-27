import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Breadcrumb } from 'antd';
import type { MenuProps, BreadcrumbProps } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Content } = Layout;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/products', icon: <ShoppingOutlined />, label: '商品' },
    { key: '/suppliers', icon: <TeamOutlined />, label: '供应商' },
    { key: '/customers', icon: <UserOutlined />, label: '客户' },
    { key: '/warehouses', icon: <BankOutlined />, label: '仓库' },
    { key: '/inventory', icon: <InboxOutlined />, label: '库存' },
    { key: '/purchases', icon: <ShoppingCartOutlined />, label: '采购' },
    { key: '/sales', icon: <ShoppingCartOutlined />, label: '销售' },
    { key: '/orders', icon: <FileTextOutlined />, label: '订单' },
    { key: '/platform-orders', icon: <FileTextOutlined />, label: '平台订单' },
    { key: '/inventory/summary', icon: <InboxOutlined />, label: '库存汇总' },
    { key: '/inventory/cd', icon: <InboxOutlined />, label: 'CD库存' },
    { key: '/inventory/emag', icon: <InboxOutlined />, label: 'EMAG库存' },
    { key: '/finance', icon: <DollarOutlined />, label: '财务' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置' },
  ];

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];

  const getBreadcrumb = (): BreadcrumbProps['items'] => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbs: BreadcrumbProps['items'] = pathSnippets.map((_, index) => {
      const url = '/' + pathSnippets.slice(0, index + 1).join('/');
      const menuItem = menuItems.find(item => item && 'key' in item && item.key === url);
      const label = (menuItem && 'label' in menuItem ? menuItem.label : undefined) as string || url;
      return { title: label };
    });
    return breadcrumbs;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        background: '#001529',
        lineHeight: '48px',
        height: '48px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 32, whiteSpace: 'nowrap' }}>
          ERP系统
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0, background: 'transparent' }}
        />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar size="small" icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
        </Dropdown>
      </Header>
      <Content style={{ padding: '16px 24px', background: '#f0f2f5', minHeight: 'calc(100vh - 48px)' }}>
        <Breadcrumb style={{ marginBottom: 16 }} items={getBreadcrumb()} />
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AppLayout;