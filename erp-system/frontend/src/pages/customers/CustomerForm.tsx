import React from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import { customerService, type CreateCustomerDto, type UpdateCustomerDto } from '../../services';

interface CustomerFormProps {
  id?: string;
  initialValues?: Partial<CreateCustomerDto>;
  onSuccess: () => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ id, initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (id && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [id, initialValues, form]);

  const handleSubmit = async (values: CreateCustomerDto) => {
    setLoading(true);
    try {
      if (id) {
        await customerService.updateCustomer(id, values as UpdateCustomerDto);
        message.success('更新成功');
      } else {
        await customerService.createCustomer(values);
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
      <Form.Item label="客户名称" name="name" rules={[{ required: true, message: '请输入客户名称' }]}>
        <Input placeholder="请输入客户名称" />
      </Form.Item>
      <Form.Item label="联系人" name="contactPerson">
        <Input placeholder="请输入联系人" />
      </Form.Item>
      <Form.Item label="电话" name="phone">
        <Input placeholder="请输入联系电话" />
      </Form.Item>
      <Form.Item label="邮箱" name="email">
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item label="地址" name="address">
        <Input.TextArea placeholder="请输入地址" rows={2} />
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

export default CustomerForm;