import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, message, Table, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { purchaseService, supplierService, warehouseService, productService, type CreatePurchaseOrderDto, type Supplier, type Warehouse, type Product } from '../../services';

interface PurchaseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface OrderItem {
  key: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  costPrice: number;
  unit: string;
  taxRate: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface FormValues {
  supplierId?: string;
  warehouseId?: string;
  discountAmount?: number;
  remark?: string;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; productCode: string; costPrice: number }[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [supplierRes, warehouseRes, productRes] = await Promise.all([
          supplierService.getSuppliers({ pageSize: 100 }),
          warehouseService.getWarehouses({ pageSize: 100 }),
          productService.getProducts({ pageSize: 100 }),
        ]);
        setSuppliers(supplierRes.list.map((s: Supplier) => ({ id: s.id, name: s.name })));
        setWarehouses(warehouseRes.list.map((w: Warehouse) => ({ id: w.id, name: w.name })));
        setProducts(productRes.list.map((p: Product) => ({
          id: p.id,
          name: p.name,
          productCode: p.productCode || '',
          costPrice: p.costPrice || 0,
        })));
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    fetchOptions();
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { key: Date.now().toString(), productId: '', warehouseId: '', quantity: 1, costPrice: 0, unit: '', taxRate: 0 },
    ]);
  };

  const removeItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const updateItem = (key: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.costPrice = product.costPrice;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = async (values: FormValues) => {
    if (items.length === 0) {
      message.error('请添加采购明细');
      return;
    }
    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      message.error('请完善采购明细');
      return;
    }

    setLoading(true);
    try {
      const data: CreatePurchaseOrderDto = {
        supplierId: values.supplierId || '',
        warehouseId: values.warehouseId || '',
        discountAmount: values.discountAmount || 0,
        remark: values.remark,
        items: validItems.map(item => ({
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          costPrice: item.costPrice,
          unit: item.unit,
          taxRate: item.taxRate,
        })),
      };
      await purchaseService.createPurchase(data);
      message.success('创建成功');
      onSuccess();
    } catch (error: unknown) {
      const err = error as ApiError;
      message.error(err.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const itemColumns: ColumnsType<OrderItem> = [
    {
      title: '商品',
      dataIndex: 'productId',
      width: 200,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="选择商品"
          value={value}
          onChange={(v) => updateItem(record.key, 'productId', v)}
        >
          {products.map(p => (
            <Select.Option key={p.id} value={p.id}>{p.name} ({p.productCode})</Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '仓库',
      dataIndex: 'warehouseId',
      width: 150,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="选择仓库"
          value={value}
          onChange={(v) => updateItem(record.key, 'warehouseId', v)}
        >
          {warehouses.map(w => (
            <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 100,
      render: (value, record) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(v) => updateItem(record.key, 'quantity', v || 1)}
        />
      ),
    },
    {
      title: '单价',
      dataIndex: 'costPrice',
      width: 120,
      render: (value, record) => (
        <InputNumber
          min={0}
          precision={2}
          value={value}
          onChange={(v) => updateItem(record.key, 'costPrice', v || 0)}
        />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 80,
      render: (value, record) => (
        <Input placeholder="单位" value={value} onChange={(e) => updateItem(record.key, 'unit', e.target.value)} />
      ),
    },
    {
      title: '税率',
      dataIndex: 'taxRate',
      width: 80,
      render: (value, record) => (
        <InputNumber
          min={0}
          max={100}
          suffix="%"
          value={value}
          onChange={(v) => updateItem(record.key, 'taxRate', v || 0)}
        />
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (_, record) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} />
      ),
    },
  ];

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item label="供应商" name="supplierId" rules={[{ required: true, message: '请选择供应商' }]}>
        <Select placeholder="选择供应商">
          {suppliers.map(s => (
            <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="默认仓库" name="warehouseId" rules={[{ required: true, message: '请选择仓库' }]}>
        <Select placeholder="选择仓库">
          {warehouses.map(w => (
            <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="折扣金额" name="discountAmount">
        <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="输入折扣金额" />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <Input.TextArea placeholder="请输入备注" rows={2} />
      </Form.Item>
      <Form.Item label="采购明细">
        <Table
          size="small"
          columns={itemColumns}
          dataSource={items}
          rowKey="key"
          pagination={false}
          footer={() => (
            <Button type="dashed" icon={<PlusOutlined />} onClick={addItem} block>
              添加商品
            </Button>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            创建采购单
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default PurchaseForm;