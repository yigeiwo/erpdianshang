import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Tag, Card, Table, Descriptions, message, Modal, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { purchaseService, type PurchaseOrder, type PurchaseOrderItem } from '../../services';
import { statusMap, formatMoney, formatDate } from '../../constants';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const PurchaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await purchaseService.getPurchase(id);
      setOrder(data);
    } catch (error: unknown) {
      const err = error as ApiError;
      message.error(err.response?.data?.message || '获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = () => {
    if (!order) return;
    Modal.confirm({
      title: '提交确认',
      content: `确认提交采购单 ${order.orderNo}？提交后将进入待审批状态。`,
      onOk: async () => {
        try {
          await purchaseService.submitPurchase(order.id);
          message.success('提交成功');
          fetchOrder();
        } catch (error: unknown) {
          const err = error as ApiError;
          message.error(err.response?.data?.message || '提交失败');
        }
      },
    });
  };

  const handleApprove = () => {
    if (!order) return;
    Modal.confirm({
      title: '审批确认',
      content: `确认审批采购单 ${order.orderNo}？`,
      onOk: async () => {
        try {
          await purchaseService.approvePurchase(order.id);
          message.success('审批成功');
          fetchOrder();
        } catch (error: unknown) {
          const err = error as ApiError;
          message.error(err.response?.data?.message || '审批失败');
        }
      },
    });
  };

  const handleComplete = () => {
    if (!order) return;
    Modal.confirm({
      title: '入库确认',
      content: `确认将采购单 ${order.orderNo} 入库？`,
      onOk: async () => {
        try {
          await purchaseService.completeIn(order.id);
          message.success('入库成功');
          fetchOrder();
        } catch (error: unknown) {
          const err = error as ApiError;
          message.error(err.response?.data?.message || '入库失败');
        }
      },
    });
  };

  const columns: ColumnsType<PurchaseOrderItem> = [
    { title: '商品名称', dataIndex: ['product', 'name'], key: 'productName' },
    { title: '商品编码', dataIndex: ['product', 'productCode'], key: 'productCode' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    {
      title: '单价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 120,
      render: formatMoney,
    },
    {
      title: '税率',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 80,
      render: (v) => `${v || 0}%`,
    },
    {
      title: '小计',
      key: 'subtotal',
      width: 120,
      render: (_, record) => {
        const amount = record.quantity * record.costPrice * (1 + (record.taxRate || 0) / 100);
        return formatMoney(amount);
      },
    },
  ];

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>加载中...</div>;
  }

  if (!order) {
    return <div style={{ padding: 24 }}>未找到订单</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={`采购单详情 - ${order.orderNo}`}
        extra={
          <Space>
            {order.status === 'draft' && (
              <Button type="primary" onClick={handleSubmit}>提交</Button>
            )}
            {order.status === 'pending' && (
              <Button type="primary" onClick={handleApprove}>审批</Button>
            )}
            {order.status === 'approved' && (
              <Button type="primary" onClick={handleComplete}>入库</Button>
            )}
            <Button onClick={() => navigate('/purchases')}>返回列表</Button>
          </Space>
        }
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="单据编号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="订单日期">{formatDate(order.orderDate)}</Descriptions.Item>
          <Descriptions.Item label="供应商">{order.supplier?.name}</Descriptions.Item>
          <Descriptions.Item label="仓库">{order.warehouse?.name}</Descriptions.Item>
          <Descriptions.Item label="订单金额">
            {formatMoney(order.totalAmount)}
          </Descriptions.Item>
          <Descriptions.Item label="折扣金额">
            {formatMoney(order.discountAmount)}
          </Descriptions.Item>
          <Descriptions.Item label="最终金额">
            <strong style={{ color: '#1890ff' }}>
              {formatMoney(order.finalAmount)}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusMap[order.status]?.color}>
              {statusMap[order.status]?.text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="制单人">{order.creator?.realName}</Descriptions.Item>
          {order.approver && (
            <Descriptions.Item label="审批人">{order.approver.realName}</Descriptions.Item>
          )}
          <Descriptions.Item label="备注" span={2}>{order.remark || '-'}</Descriptions.Item>
        </Descriptions>

        <Divider>采购明细</Divider>

        <Table
          columns={columns}
          dataSource={order.items || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default PurchaseDetail;