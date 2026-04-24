import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Empty, Select, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { inventoryService, warehouseService, type Inventory, type InventoryLog } from '../../services';
import AdjustForm from './AdjustForm';

const InventoryList: React.FC = () => {
  const [data, setData] = useState<Inventory[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [adjustVisible, setAdjustVisible] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>();
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const result = await inventoryService.getInventory({ page, pageSize, warehouseId: warehouseFilter });
      setData(result.list);
      setPagination({ current: page, pageSize, total: result.total });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const result = await warehouseService.getWarehouses({ pageSize: 100 });
      setWarehouses(result.list.map(w => ({ id: (w as any).id || w.id, name: (w as any).name })));
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getLogs(undefined, warehouseFilter);
      setLogs(result);
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchWarehouses();
  }, [warehouseFilter]);

  const logTypeMap: Record<string, { color: string; text: string }> = {
    purchase_in: { color: 'green', text: '采购入库' },
    sale_out: { color: 'red', text: '销售出库' },
    adjust: { color: 'blue', text: '库存调整' },
    check: { color: 'purple', text: '库存盘点' },
  };

  const columns: ColumnsType<Inventory> = [
    { title: '商品编码', dataIndex: ['product', 'productCode'], key: 'productCode', width: 120 },
    { title: '商品名称', dataIndex: ['product', 'name'], key: 'productName' },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse', width: 120 },
    { title: '总数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
    { title: '可用数量', dataIndex: 'availableQuantity', key: 'availableQuantity', width: 100 },
    { title: '锁定数量', dataIndex: 'lockedQuantity', key: 'lockedQuantity', width: 100 },
    {
      title: '最后盘点',
      dataIndex: 'lastCheckDate',
      key: 'lastCheckDate',
      width: 120,
      render: (v) => v ? new Date(v).toLocaleDateString() : '-',
    },
  ];

  const logColumns: ColumnsType<InventoryLog> = [
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 160,
      render: (v) => new Date(v).toLocaleString() },
    { title: '商品', dataIndex: ['product', 'name'], key: 'product' },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v) => {
        const t = logTypeMap[v] || { color: 'default', text: v };
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    { title: '数量变化', dataIndex: 'quantity', key: 'quantity', width: 120,
      render: (v) => {
        const prefix = v > 0 ? '+' : '';
        return <span style={{ color: v > 0 ? '#52c41a' : '#f5222d' }}>{prefix}{v}</span>;
      }
    },
    { title: '单据号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '操作人', dataIndex: ['creator', 'realName'], key: 'creator' },
  ];

  return (
    <div>
      <h2>库存管理</h2>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={() => setAdjustVisible(true)}>库存盘点</Button>
        <Button onClick={() => { fetchLogs(); setLogVisible(true); }}>操作记录</Button>
        <Select
          placeholder="筛选仓库"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setWarehouseFilter(v)}
        >
          {warehouses.map(w => (
            <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
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
        title="库存盘点"
        open={adjustVisible}
        onCancel={() => setAdjustVisible(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        <AdjustForm
          onSuccess={() => {
            setAdjustVisible(false);
            fetchData();
          }}
          onCancel={() => setAdjustVisible(false)}
        />
      </Modal>
      <Modal
        title="库存操作记录"
        open={logVisible}
        onCancel={() => setLogVisible(false)}
        footer={<Button onClick={() => setLogVisible(false)}>关闭</Button>}
        width={1000}
      >
        <Table
          columns={logColumns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          locale={{ emptyText: <Empty description="暂无记录" /> }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        />
      </Modal>
    </div>
  );
};

export default InventoryList;