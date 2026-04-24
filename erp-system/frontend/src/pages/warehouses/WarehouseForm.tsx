import React from 'react';
import { Form, Input, InputNumber, Button, Space, message } from 'antd';
import { warehouseService, type CreateWarehouseDto, type UpdateWarehouseDto } from '../../services';

interface WarehouseFormProps {
  id?: string;
  initialValues?: Partial<CreateWarehouseDto>;
  onSuccess: () => void;
  onCancel: () => void;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({ id, initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (id && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [id, initialValues, form]);

  const handleSubmit = async (values: CreateWarehouseDto) => {
    setLoading(true);
    try {
      if (id) {
        await warehouseService.updateWarehouse(id, values as UpdateWarehouseDto);
        message.success('更新成功');
      } else {
        await warehouseService.createWarehouse(values);
        message.success('创建成功');
      }
      onSuccess();
    } catch (error: any) {
      message.error(error.response?.data?.message || (id ? '更新失败' : '创建失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={initialValues}>
      <Form.Item label="仓库名称" name="name" rules={[{ required: true, message: '请输入仓库名称' }]}>
        <Input placeholder="请输入仓库名称" />
      </Form.Item>
      <Form.Item label="地址" name="address">
        <Input.TextArea placeholder="请输入仓库地址" rows={2} />
      </Form.Item>
      <Form.Item label="管理员" name="manager">
        <Input placeholder="请输入管理员姓名" />
      </Form.Item>
      <Form.Item label="联系电话" name="phone">
        <Input placeholder="请输入联系电话" />
      </Form.Item>
      <Form.Item label="容量" name="capacity">
        <InputNumber placeholder="请输入容量" min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <Input.TextArea placeholder="请输入备注" rows={2} />
      </Form.Item>
      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {id ? '更新' : '创建'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default WarehouseForm;