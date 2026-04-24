import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Empty, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { purchaseService, type PurchaseOrder } from '../../services';
import PurchaseForm from './PurchaseForm';

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
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const result = await purchaseService.getPurchases({ page, pageSize, status: statusFilter });
      setData(result.list);
      setPagination({ current: page, pageSize, total: result.total });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleView = async (record: PurchaseOrder) => {
    try {
      const order = await purchaseService.getPurchase(record.id);
      setSelectedOrder(order);
      setDetailVisible(true);
    } catch (error: any) {
      message.error('获取详情失败');
    }
  };

  const handleSubmit = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '提交确认',
      content: `确认提交采购单 ${record.orderNo}？提交后将进入待审批状态。`,
      onOk: async () => {
        try {
          await purchaseService.submitPurchase(record.id);
          message.success('提交成功');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || '提交失败');
        }
      },
    });
  };

  const handleApprove = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '审批确认',
      content: `确认审批采购单 ${record.orderNo}？`,
      onOk: async () => {
        try {
          await purchaseService.approvePurchase(record.id);
          message.success('审批成功');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || '审批失败');
        }
      },
    });
  };

  const handleComplete = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '入库确认',
      content: `确认将采购单 ${record.orderNo} 入库？`,
      onOk: async () => {
        try {
          await purchaseService.completeIn(record.id);
          message.success('入库成功');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || '入库失败');
        }
      },
    });
  };

  const columns: ColumnsType<PurchaseOrder> = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier' },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    { title: '订单金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120,
      render: (v) => `¥${Number(v || 0).toFixed(2)}` },
    { title: '最终金额', dataIndex: 'finalAmount', key: 'finalAmount', width: 120,
      render: (v) => `¥${Number(v || 0).toFixed(2)}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => {
        const status = statusMap[v] || { color: 'default', text: v };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleView(record)}>查看</Button>
          {record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => handleSubmit(record)}>提交</Button>
          )}
          {record.status === 'pending' && (
            <Button type="link" size="small" onClick={() => handleApprove(record)}>审批</Button>
          )}
          {record.status === 'approved' && (
            <Button type="link" size="small" onClick={() => handleComplete(record)}>入库</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>采购管理</h2>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={() => setModalVisible(true)}>新建采购单</Button>
        <Select
          placeholder="筛选状态"
          allowClear
          style={{ width: 120 }}
          onChange={(v) => setStatusFilter(v)}
        >
          {Object.entries(statusMap).map(([k, v]) => (
            <Select.Option key={k} value={k}>{v.text}</Select.Option>
          ))}
        </Select>
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => fetchData(page, pageSize),
        }}
      />
      <Modal
        title="新建采购单"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <PurchaseForm
          onSuccess={() => {
            setModalVisible(false);
            fetchData();
          }}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
      <Modal
        title="采购单详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedOrder(null);
        }}
        footer={
          <Space>
            {selectedOrder?.status === 'draft' && (
              <Button type="primary" onClick={() => {
                setDetailVisible(false);
                handleSubmit(selectedOrder);
              }}>提交</Button>
            )}
            {selectedOrder?.status === 'pending' && (
              <Button type="primary" onClick={() => {
                setDetailVisible(false);
                handleApprove(selectedOrder);
              }}>审批</Button>
            )}
            {selectedOrder?.status === 'approved' && (
              <Button type="primary" onClick={() => {
                setDetailVisible(false);
                handleComplete(selectedOrder);
              }}>入库</Button>
            )}
            <Button onClick={() => setDetailVisible(false)}>关闭</Button>
          </Space>
        }
        width={700}
      >
        {selectedOrder && (
          <div>
            <p><strong>单据编号：</strong>{selectedOrder.orderNo}</p>
            <p><strong>供应商：</strong>{selectedOrder.supplier?.name}</p>
            <p><strong>仓库：</strong>{selectedOrder.warehouse?.name}</p>
            <p><strong>订单金额：</strong>¥{Number(selectedOrder.totalAmount || 0).toFixed(2)}</p>
            <p><strong>折扣金额：</strong>¥{Number(selectedOrder.discountAmount || 0).toFixed(2)}</p>
            <p><strong>最终金额：</strong>¥{Number(selectedOrder.finalAmount || 0).toFixed(2)}</p>
            <p><strong>状态：</strong>
              <Tag color={statusMap[selectedOrder.status]?.color}>
                {statusMap[selectedOrder.status]?.text}
              </Tag>
            </p>
            {selectedOrder.items?.length > 0 && (
              <>
                <h4>采购明细</h4>
                <Table
                  size="small"
                  dataSource={selectedOrder.items}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '商品', dataIndex: ['product', 'name'], key: 'product' },
                    { title: '商品编码', dataIndex: ['product', 'productCode'], key: 'code' },
                    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                    { title: '单价', dataIndex: 'costPrice', key: 'costPrice',
                      render: (v) => `¥${Number(v || 0).toFixed(2)}` },
                    { title: '税率', dataIndex: 'taxRate', key: 'taxRate',
                      render: (v) => `${v}%` },
                  ]}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseList;