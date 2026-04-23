import React from 'react';
import { Card, Tabs, Table, Button, Space, Tag } from 'antd';

const SettingsPage: React.FC = () => {
  const roleColumns = [
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '状态', dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag> },
    { title: '操作', key: 'action', render: () => <Button type="link" size="small">编辑</Button> },
  ];

  const userColumns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '真实姓名', dataIndex: 'realName', key: 'realName' },
    { title: '状态', dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag> },
    { title: '操作', key: 'action', render: () => <Button type="link" size="small">编辑</Button> },
  ];

  const tabItems = [
    {
      key: 'roles',
      label: '角色管理',
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary">新增角色</Button>
          </Space>
          <Table columns={roleColumns} dataSource={[]} rowKey="id" />
        </div>
      ),
    },
    {
      key: 'users',
      label: '用户管理',
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary">新增用户</Button>
          </Space>
          <Table columns={userColumns} dataSource={[]} rowKey="id" />
        </div>
      ),
    },
    {
      key: 'permissions',
      label: '权限管理',
      children: <div>权限配置页面</div>,
    },
    {
      key: 'system',
      label: '系统设置',
      children: <div>系统配置页面</div>,
    },
  ];

  return (
    <div>
      <h2>系统设置</h2>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default SettingsPage;
