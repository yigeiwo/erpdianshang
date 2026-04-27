import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, message, Select } from 'antd';
import { inventoryService, warehouseService, productService, type Warehouse, type Product, type AdjustInventoryDto } from '../../services';

interface AdjustFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormValues {
  productId?: string;
  warehouseId?: string;
  quantity?: number;
  type?: 'add' | 'reduce' | 'set';
  reason?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const AdjustForm: React.FC<AdjustFormProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; productCode: string }[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [warehouseRes, productRes] = await Promise.all([
          warehouseService.getWarehouses({ pageSize: 100 }),
          productService.getProducts({ pageSize: 100 }),
        ]);
        setWarehouses(warehouseRes.list.map((w: Warehouse) => ({ id: w.id, name: w.name })));
        setProducts(productRes.list.map((p: Product) => ({
          id: p.id,
          name: p.name,
          productCode: p.productCode || '',
        })));
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (values: FormValues) => {
    if (!values.productId || !values.warehouseId) {
      message.error('请选择商品和仓库');
      return;
    }
    setLoading(true);
    try {
      const data: AdjustInventoryDto = {
        productId: values.productId,
        warehouseId: values.warehouseId,
        quantity: values.quantity || 0,
        type: values.type || 'add',
        reason: values.reason || '',
      };
      await inventoryService.adjustInventory(data);
      message.success('调整成功');
      onSuccess();
    } catch (error: unknown) {
      const err = error as ApiError;
      message.error(err.response?.data?.message || '调整失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item label="商品" name="productId" rules={[{ required: true, message: '请选择商品' }]}>
        <Select placeholder="选择商品" showSearch>
          {products.map(p => (
            <Select.Option key={p.id} value={p.id}>{p.name} ({p.productCode})</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="仓库" name="warehouseId" rules={[{ required: true, message: '请选择仓库' }]}>
        <Select placeholder="选择仓库">
          {warehouses.map(w => (
            <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="调整类型" name="type" rules={[{ required: true, message: '请选择调整类型' }]}>
        <Select placeholder="选择调整类型">
          <Select.Option value="add">增加</Select.Option>
          <Select.Option value="reduce">减少</Select.Option>
          <Select.Option value="set">设置为</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="数量" name="quantity" rules={[{ required: true, message: '请输入数量' }]}>
        <InputNumber min={0} style={{ width: '100%' }} placeholder="输入数量" />
      </Form.Item>
      <Form.Item label="调整原因" name="reason" rules={[{ required: true, message: '请输入调整原因' }]}>
        <Input.TextArea placeholder="请输入调整原因" rows={3} />
      </Form.Item>
      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            确认调整
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AdjustForm;