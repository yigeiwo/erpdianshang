import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Tag, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { productService } from '../../services';
import ProductForm from './ProductForm';
import type { PageResult } from '../../types';

interface Product {
  id: string;
  name: string;
  productCode: string;
  category?: { name: string };
  supplier?: { name: string };
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  isActive: boolean;
}

const ProductList: React.FC = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const result: PageResult<Product> = await productService.getProducts({ page, pageSize });
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
  }, []);

  const handleEdit = (record: Product) => {
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      onOk: async () => {
        try {
          await productService.deleteProduct(id);
          message.success('删除成功');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败');
        }
      },
    });
  };

  const columns: ColumnsType<Product> = [
    { title: '商品编码', dataIndex: 'productCode', key: 'productCode', width: 120 },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: ['category', 'name'], key: 'category' },
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier' },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '成本价', dataIndex: 'costPrice', key: 'costPrice', width: 100,
      render: (v) => `¥${v?.toFixed(2) || '0.00'}` },
    { title: '销售价', dataIndex: 'salePrice', key: 'salePrice', width: 100,
      render: (v) => `¥${v?.toFixed(2) || '0.00'}` },
    { title: '库存', dataIndex: 'stock', key: 'stock', width: 80 },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>商品管理</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            setEditingId(undefined);
            setModalVisible(true);
          }}
        >
          新增商品
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => fetchData(page, pageSize),
        }}
      />
      <Modal
        title={editingId ? '编辑商品' : '新增商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <ProductForm
          id={editingId}
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

export default ProductList;
