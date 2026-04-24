import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Empty, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { saleService, type SaleOrder } from '../../services';
import SaleForm from './SaleForm';

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
  const navigate = useNavigate();
  const [data, setData] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const result = await saleService.getSales({ page, pageSize, status: statusFilter });
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

  const handleView = (record: SaleOrder) => {
    navigate(`/sales/${record.id}`);
  };

  const handleSubmit = (record: SaleOrder) => {
    Modal.confirm({
      title: '提交确认',
      content: `确认提交销售单 ${record.orderNo}？提交后将进入待审批状态。`,
      onOk: async () => {
        try {
          await saleService.submitSale(record.id);
          message.success('提交成功');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || '提交失败');
        }
      },
    });
  };

  const handleApprove = (record: SaleOrder) => {
    Modal.confirm({
      title: '审批确认',
      content: `确认审批销售单 ${record.orderNo}？`,
      onOk: async () => {
        try {
          await saleService.approveSale(record.id);
          message.success('审批成功');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || '审批失败');
        }
      },
    });
  };

  const handleShip = (record: SaleOrder) => {
    Modal.confirm({
      title: '出库确认',
      content: `确认将销售单 ${record.orderNo} 出库？`,
      onOk: async () => {
        try {
          await saleService.shipSale(record.id);
          message.success('出库成功');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || '出库失败');
        }
      },
    });
  };

  const columns: ColumnsType<SaleOrder> = [
    { title: '单据编号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '客户', dataIndex: ['customer', 'name'], key: 'customer' },
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
            <Button type="link" size="small" onClick={() => handleShip(record)}>出库</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>销售管理</h2>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={() => setModalVisible(true)}>新建销售单</Button>
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
        title="新建销售单"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <SaleForm
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

export default SaleList;