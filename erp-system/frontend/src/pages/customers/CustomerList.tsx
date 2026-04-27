import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Modal, message, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined } from '@ant-design/icons';
import { customerService, type Customer } from '../../services';
import CustomerForm from './CustomerForm';
import { formatMoney, isActiveTag } from '../../constants';

const CustomerList: React.FC = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchData = useCallback(async (page = 1, pageSize = 10) => {
    setRefreshing(true);
    try {
      const result = await customerService.getCustomers({ page, pageSize });
      setData(result.list);
      setPagination({ current: page, pageSize, total: result.total });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '获取数据失败');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(pagination.current, pagination.pageSize);
  };

  const handleEdit = (record: Customer) => {
    setSelectedCustomer(record);
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      onOk: async () => {
        try {
          await customerService.deleteCustomer(id);
          message.success('删除成功');
          fetchData();
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          message.error(err.response?.data?.message || '删除失败');
        }
      },
    });
  };

  const handleView = (record: Customer) => {
    setSelectedCustomer(record);
    setDetailVisible(true);
  };

  const columns: ColumnsType<Customer> = [
    { title: '客户名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: '累计金额', dataIndex: 'totalAmount', key: 'totalAmount', render: formatMoney },
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
        <h2 style={{ margin: 0 }}>客户管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>刷新</Button>
          <Button type="primary" onClick={() => { setEditingId(undefined); setSelectedCustomer(null); setModalVisible(true); }}>
            新增客户
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
        title={editingId ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setSelectedCustomer(null); }}
        footer={null}
        width={500}
        destroyOnClose
      >
        <CustomerForm
          id={editingId}
          initialValues={selectedCustomer || undefined}
          onSuccess={() => { setModalVisible(false); setSelectedCustomer(null); fetchData(); }}
          onCancel={() => { setModalVisible(false); setSelectedCustomer(null); }}
        />
      </Modal>
      <Modal
        title="客户详情"
        open={detailVisible}
        onCancel={() => { setDetailVisible(false); setSelectedCustomer(null); }}
        footer={<Button onClick={() => setDetailVisible(false)}>关闭</Button>}
        width={500}
      >
        {selectedCustomer && (
          <div>
            <p><strong>客户名称：</strong>{selectedCustomer.name}</p>
            <p><strong>联系人：</strong>{selectedCustomer.contactPerson || '-'}</p>
            <p><strong>电话：</strong>{selectedCustomer.phone || '-'}</p>
            <p><strong>邮箱：</strong>{selectedCustomer.email || '-'}</p>
            <p><strong>地址：</strong>{selectedCustomer.address || '-'}</p>
            <p><strong>累计金额：</strong>{formatMoney(selectedCustomer.totalAmount)}</p>
            <p><strong>状态：</strong>{isActiveTag(selectedCustomer.isActive)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerList;