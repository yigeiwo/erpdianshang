import React, { useState } from 'react';
import { Table, Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface SaleOrder {
  id: string;
  orderNo: string;
  customer: { name: string };
  warehouse: { name: string };
  totalAmount: number;
  finalAmount: number;
  status: string;
  orderDate: string;
}

const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'orange', text: '待审批' },
  approved: { color: 'blue', text: '已审批' },
  rejected: { color: 'red', text: '已拒绝' },
  in_progress: { color: 'processing', text: '进行中' },
  completed: { color: 'green', text: '已完成' },
  cancelled: { color: 'default', text: '已取消' },
};

const SaleList: React.FC = () => {
  const [data] = useState<SaleOrder[]>([]);
  const [loading] = useState(false);

  const columns: ColumnsType<SaleOrder> = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '客户', dataIndex: ['customer', 'name'], key: 'customer' },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    { title: '订单日期', dataIndex: 'orderDate', key: 'orderDate' },
    { title: '订单金额', dataIndex: 'totalAmount', key: 'totalAmount',
      render: (v) => `¥${v?.toFixed(2) || '0.00'}` },
    { title: '最终金额', dataIndex: 'finalAmount', key: 'finalAmount',
      render: (v) => `¥${v?.toFixed(2) || '0.00'}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => {
        const status = statusMap[v] || { color: 'default', text: v };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">查看</Button>
          {record.status === 'pending' && <Button type="link" size="small">审批</Button>}
          {record.status === 'approved' && <Button type="link" size="small">出库</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>销售管理</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">新建销售单</Button>
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

export default SaleList;
