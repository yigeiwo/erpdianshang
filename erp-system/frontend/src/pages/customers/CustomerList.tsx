import React, { useState } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  totalAmount: number;
  isActive: boolean;
}

const CustomerList: React.FC = () => {
  const [data] = useState<Customer[]>([]);
  const [loading] = useState(false);

  const handleCreate = () => {
    message.info('新增客户功能开发中');
  };

  const columns: ColumnsType<Customer> = [
    { title: '客户名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '累计金额', dataIndex: 'totalAmount', key: 'totalAmount',
      render: (v) => `¥${v?.toFixed(2) || '0.00'}` },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag>,
    },
  ];

  return (
    <div>
      <h2>客户管理</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleCreate}>新增客户</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default CustomerList;