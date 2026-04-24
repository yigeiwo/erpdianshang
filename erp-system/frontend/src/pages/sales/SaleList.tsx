import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, message } from 'antd';
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

  const handleView = (record: SaleOrder) => {
    Modal.info({
      title: '销售单详情',
      content: (
        <div>
          <p>单据编号：{record.orderNo}</p>
          <p>客户：{record.customer?.name}</p>
          <p>仓库：{record.warehouse?.name}</p>
          <p>订单日期：{record.orderDate}</p>
          <p>订单金额：¥{record.totalAmount?.toFixed(2) || '0.00'}</p>
          <p>最终金额：¥{record.finalAmount?.toFixed(2) || '0.00'}</p>
        </div>
      ),
    });
  };

  const handleApprove = (record: SaleOrder) => {
    Modal.confirm({
      title: '审批确认',
      content: `确认审批销售单 ${record.orderNo}？`,
      onOk: () => {
        message.success('审批成功');
      },
    });
  };

  const handleOutbound = (record: SaleOrder) => {
    Modal.confirm({
      title: '出库确认',
      content: `确认将销售单 ${record.orderNo} 出库？`,
      onOk: () => {
        message.success('出库成功');
      },
    });
  };

  const handleCreate = () => {
    message.info('新建销售单功能开发中');
  };

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
          <Button type="link" size="small" onClick={() => handleView(record)}>查看</Button>
          {record.status === 'pending' && <Button type="link" size="small" onClick={() => handleApprove(record)}>审批</Button>}
          {record.status === 'approved' && <Button type="link" size="small" onClick={() => handleOutbound(record)}>出库</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>销售管理</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleCreate}>新建销售单</Button>
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