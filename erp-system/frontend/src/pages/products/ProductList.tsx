import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Tag, Modal, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { productService } from '../../services';
import ProductForm from './ProductForm';
import type { PageResult } from '../../types';

interface Product {
  id: string;
  name: string;
  productCode: string;
  barcode?: string;
  category?: { name: string };
  supplier?: { name: string };
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
  salesCount?: number;
}

const ProductList: React.FC = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleView = (record: Product) => {
    setSelectedProduct(record);
    setDetailVisible(true);
  };

  const columns: ColumnsType<Product> = [
    { title: '图片', dataIndex: 'imageUrl', key: 'image', width: 80,
      render: (v) => v ? <Image width={40} height={40} src={v} style={{objectFit: 'cover'}} placeholder={<div style={{width: 40, height: 40, background: '#f0f0f0'}} />} /> : <div style={{width: 40, height: 40, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999'}}>无图</div> },
    { title: '商品编码', dataIndex: 'productCode', key: 'productCode', width: 120 },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: ['category', 'name'], key: 'category' },
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier' },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: '成本价', dataIndex: 'costPrice', key: 'costPrice', width: 90,
      render: (v) => `¥${Number(v || 0).toFixed(2)}` },
    { title: '销售价', dataIndex: 'salePrice', key: 'salePrice', width: 90,
      render: (v) => `¥${Number(v || 0).toFixed(2)}` },
    { title: '库存', dataIndex: 'stock', key: 'stock', width: 70 },
    { title: '销量', dataIndex: 'salesCount', key: 'salesCount', width: 70,
      render: (v) => v || 0 },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 70,
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
      <Modal
        title="商品详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailVisible(false)}>关闭</Button>
          </Space>
        }
        width={700}
      >
        {selectedProduct && (
          <div>
            <div style={{ display: 'flex', gap: 24 }}>
              {selectedProduct.imageUrl && (
                <div>
                  <Image
                    width={200}
                    height={200}
                    src={selectedProduct.imageUrl}
                    style={{ objectFit: 'contain', background: '#f5f5f5' }}
                  />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p><strong>商品名称：</strong>{selectedProduct.name}</p>
                <p><strong>商品编码：</strong>{selectedProduct.productCode}</p>
                <p><strong>条形码：</strong>{selectedProduct.barcode || '-'}</p>
                <p><strong>分类：</strong>{selectedProduct.category?.name || '-'}</p>
                <p><strong>供应商：</strong>{selectedProduct.supplier?.name || '-'}</p>
                <p><strong>单位：</strong>{selectedProduct.unit}</p>
                <p><strong>成本价：</strong>¥{Number(selectedProduct.costPrice || 0).toFixed(2)}</p>
                <p><strong>销售价：</strong>¥{Number(selectedProduct.salePrice || 0).toFixed(2)}</p>
                <p><strong>当前库存：</strong>{selectedProduct.stock}</p>
                <p><strong>状态：</strong>
                  <Tag color={selectedProduct.isActive ? 'green' : 'red'}>
                    {selectedProduct.isActive ? '启用' : '禁用'}
                  </Tag>
                </p>
              </div>
            </div>
            {selectedProduct.description && (
              <div style={{ marginTop: 16 }}>
                <strong>商品描述：</strong>
                <p style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  {selectedProduct.description}
                </p>
              </div>
            )}
            {selectedProduct.imageUrl && (
              <div style={{ marginTop: 16 }}>
                <strong>商品链接：</strong>
                <a href={selectedProduct.imageUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                  {selectedProduct.imageUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
