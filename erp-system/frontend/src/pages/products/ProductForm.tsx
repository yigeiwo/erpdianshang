import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { productService, supplierService } from '../../services';

const { Option } = Select;

interface ProductFormProps {
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ id, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [suppliers, setSuppliers] = React.useState<any[]>([]);

  useEffect(() => {
    fetchSuppliers();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchSuppliers = async () => {
    try {
      const result = await supplierService.getSuppliers({ page: 1, pageSize: 100 });
      setSuppliers(result.list as any);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const product = await productService.getProduct(id);
      form.setFieldsValue(product);
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取商品失败');
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (id) {
        await productService.updateProduct(id, values);
        message.success('更新成功');
      } else {
        await productService.createProduct(values);
        message.success('创建成功');
      }
      onSuccess?.();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={id ? '编辑商品' : '新增商品'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          unit: '件',
          isActive: true,
        }}
      >
        <Form.Item
          label="商品编码"
          name="productCode"
          rules={[{ required: true, message: '请输入商品编码' }]}
        >
          <Input placeholder="请输入商品编码" />
        </Form.Item>

        <Form.Item
          label="商品名称"
          name="name"
          rules={[{ required: true, message: '请输入商品名称' }]}
        >
          <Input placeholder="请输入商品名称" />
        </Form.Item>

        <Form.Item label="条形码" name="barcode">
          <Input placeholder="请输入条形码" />
        </Form.Item>

        <Form.Item label="供应商" name="supplierId">
          <Select allowClear placeholder="请选择供应商">
            {suppliers.map((s) => (
              <Option key={s.id} value={s.id}>{s.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="单位" name="unit">
          <Input placeholder="如：件、个、箱" />
        </Form.Item>

        <Form.Item
          label="成本价"
          name="costPrice"
          rules={[{ required: true, message: '请输入成本价' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            style={{ width: '100%' }}
            placeholder="0.00"
            prefix="¥"
          />
        </Form.Item>

        <Form.Item
          label="销售价"
          name="salePrice"
          rules={[{ required: true, message: '请输入销售价' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            style={{ width: '100%' }}
            placeholder="0.00"
            prefix="¥"
          />
        </Form.Item>

        <Form.Item label="最低库存" name="minStock">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
        </Form.Item>

        <Form.Item label="最高库存" name="maxStock">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
        </Form.Item>

        <Form.Item label="商品图片" name="imageUrl">
          <Input placeholder="请输入图片URL" />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input.TextArea rows={3} placeholder="请输入商品描述" />
        </Form.Item>

        <Form.Item name="isActive" valuePropName="checked">
          <label>是否启用</label>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? '更新' : '创建'}
            </Button>
            <Button onClick={onCancel || (() => navigate('/products'))}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProductForm;
