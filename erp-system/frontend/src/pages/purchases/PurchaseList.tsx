import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplier: { name: string };
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

const PurchaseList: React.FC = () => {
  const [data] = useState<PurchaseOrder[]>([]);
  const [loading] = useState(false);

  const handleView = (record: PurchaseOrder) => {
    Modal.info({
      title: '采购单详情',
      content: (
        <div>
          <p>单据编号：{record.orderNo}</p>
          <p>供应商：{record.supplier?.name}</p>
          <p>仓库：{record.warehouse?.name}</p>
          <p>订单日期：{record.orderDate}</p>
          <p>订单金额：¥{record.totalAmount?.toFixed(2) || '0.00'}</p>
          <p>最终金额：¥{record.finalAmount?.toFixed(2) || '0.00'}</p>
        </div>
      ),
    });
  };

  const handleApprove = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '审批确认',
      content: `确认审批采购单 ${record.orderNo}？`,
      onOk: () => {
        message.success('审批成功');
      },
    });
  };

  const handleInbound = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '入库确认',
      content: `确认将采购单 ${record.orderNo} 入库？`,
      onOk: () => {
        message.success('入库成功');
      },
    });
  };

  const handleCreate = () => {
    message.info('新建采购单功能开发中');
  };

  const columns: ColumnsType<PurchaseOrder> = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier' },
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
          {record.status === 'approved' && <Button type="link" size="small" onClick={() => handleInbound(record)}>入库</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>采购管理</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleCreate}>新建采购单</Button>
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

export default PurchaseList;