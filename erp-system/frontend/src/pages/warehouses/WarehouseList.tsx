import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Modal, message, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined } from '@ant-design/icons';
import { warehouseService, type Warehouse } from '../../services';
import WarehouseForm from './WarehouseForm';
import { isActiveTag } from '../../constants';

const WarehouseList: React.FC = () => {
  const [data, setData] = useState<Warehouse[]>([]);
  const [, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  const fetchData = useCallback(async (page = 1, pageSize = 10, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await warehouseService.getWarehouses({ page, pageSize });
      setData(result.list);
      setPagination({ current: page, pageSize, total: result.total });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '获取数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(pagination.current, pagination.pageSize, true);
  };

  const handleEdit = (record: Warehouse) => {
    setSelectedWarehouse(record);
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      onOk: async () => {
        try {
          await warehouseService.deleteWarehouse(id);
          message.success('删除成功');
          fetchData();
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          message.error(err.response?.data?.message || '删除失败');
        }
      },
    });
  };

  const handleView = (record: Warehouse) => {
    setSelectedWarehouse(record);
    setDetailVisible(true);
  };

  const columns: ColumnsType<Warehouse> = [
    { title: '仓库名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: '管理员', dataIndex: 'manager', key: 'manager' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '容量', dataIndex: 'capacity', key: 'capacity' },
    { title: '状态', dataIndex: 'isActive', key: 'isActive', render: isActiveTag },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleView(record)}>查看</Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>仓库管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>刷新</Button>
          <Button type="primary" onClick={() => { setEditingId(undefined); setSelectedWarehouse(null); setModalVisible(true); }}>
            新增仓库
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={refreshing}
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
        title={editingId ? '编辑仓库' : '新增仓库'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setSelectedWarehouse(null); }}
        footer={null}
        width={500}
        destroyOnClose
      >
        <WarehouseForm
          id={editingId}
          initialValues={selectedWarehouse || undefined}
          onSuccess={() => { setModalVisible(false); setSelectedWarehouse(null); fetchData(); }}
          onCancel={() => { setModalVisible(false); setSelectedWarehouse(null); }}
        />
      </Modal>
      <Modal
        title="仓库详情"
        open={detailVisible}
        onCancel={() => { setDetailVisible(false); setSelectedWarehouse(null); }}
        footer={<Button onClick={() => setDetailVisible(false)}>关闭</Button>}
        width={500}
      >
        {selectedWarehouse && (
          <div>
            <p><strong>仓库名称：</strong>{selectedWarehouse.name}</p>
            <p><strong>地址：</strong>{selectedWarehouse.address || '-'}</p>
            <p><strong>管理员：</strong>{selectedWarehouse.manager || '-'}</p>
            <p><strong>联系电话：</strong>{selectedWarehouse.phone || '-'}</p>
            <p><strong>容量：</strong>{selectedWarehouse.capacity || '-'}</p>
            <p><strong>状态：</strong>{isActiveTag(selectedWarehouse.isActive)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WarehouseList;