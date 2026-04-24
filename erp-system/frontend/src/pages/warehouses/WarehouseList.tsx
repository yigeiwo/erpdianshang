import React, { useState } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Warehouse {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  capacity: number;
  isActive: boolean;
}

const WarehouseList: React.FC = () => {
  const [data] = useState<Warehouse[]>([]);
  const [loading] = useState(false);

  const handleCreate = () => {
    message.info('新增仓库功能开发中');
  };

  const columns: ColumnsType<Warehouse> = [
    { title: '仓库名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '管理员', dataIndex: 'manager', key: 'manager' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '容量', dataIndex: 'capacity', key: 'capacity' },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag>,
    },
  ];

  return (
    <div>
      <h2>仓库管理</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleCreate}>新增仓库</Button>
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

export default WarehouseList;