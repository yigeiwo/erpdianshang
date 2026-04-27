import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Tag, Modal, message, Empty, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { ReloadOutlined } from '@ant-design/icons';
import { purchaseService, type PurchaseOrder } from '../../services';
import PurchaseForm from './PurchaseForm';
import { statusMap, formatMoney } from '../../constants';

const PurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchData = useCallback(async (page = 1, pageSize = 10, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await purchaseService.getPurchases({ page, pageSize, status: statusFilter });
      setData(result.list);
      setPagination({ current: page, pageSize, total: result.total });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '获取数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(pagination.current, pagination.pageSize, true);
  };

  const handleView = (record: PurchaseOrder) => {
    navigate(`/purchases/${record.id}`);
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
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          message.error(err.response?.data?.message || '提交失败');
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
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          message.error(err.response?.data?.message || '审批失败');
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
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          message.error(err.response?.data?.message || '入库失败');
        }
      },
    });
  };

  const columns: ColumnsType<PurchaseOrder> = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier' },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    { title: '订单金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120,
      render: formatMoney },
    { title: '最终金额', dataIndex: 'finalAmount', key: 'finalAmount', width: 120,
      render: formatMoney },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>采购管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>刷新</Button>
          <Button type="primary" onClick={() => setModalVisible(true)}>新建采购单</Button>
        </Space>
      </div>
      <Space style={{ marginBottom: 16 }} wrap>
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
    </div>
  );
};

export default PurchaseList;