import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Tag, Card, Table, Descriptions, message, Modal, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { saleService, type SaleOrder } from '../../services';
import { statusMap, formatMoney, formatDate } from '../../constants';

const SaleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<SaleOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await saleService.getSale(id);
      setOrder(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!order) return;
    Modal.confirm({
      title: '提交确认',
      content: `确认提交销售单 ${order.orderNo}？提交后将进入待审批状态。`,
      onOk: async () => {
        try {
          await saleService.submitSale(order.id);
          message.success('提交成功');
          fetchOrder();
        } catch (error: any) {
          message.error(error.response?.data?.message || '提交失败');
        }
      },
    });
  };

  const handleApprove = () => {
    if (!order) return;
    Modal.confirm({
      title: '审批确认',
      content: `确认审批销售单 ${order.orderNo}？`,
      onOk: async () => {
        try {
          await saleService.approveSale(order.id);
          message.success('审批成功');
          fetchOrder();
        } catch (error: any) {
          message.error(error.response?.data?.message || '审批失败');
        }
      },
    });
  };

  const handleShip = () => {
    if (!order) return;
    Modal.confirm({
      title: '出库确认',
      content: `确认将销售单 ${order.orderNo} 出库？`,
      onOk: async () => {
        try {
          await saleService.shipSale(order.id);
          message.success('出库成功');
          fetchOrder();
        } catch (error: any) {
          message.error(error.response?.data?.message || '出库失败');
        }
      },
    });
  };

  const columns: ColumnsType<any> = [
    { title: '商品名称', dataIndex: ['product', 'name'], key: 'productName' },
    { title: '商品编码', dataIndex: ['product', 'productCode'], key: 'productCode' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
    {
      title: '单价',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 120,
      render: formatMoney,
    },
    {
      title: '折扣率',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 80,
      render: (v) => `${v || 0}%`,
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
        const amount = record.quantity * record.salePrice * (1 - (record.discountRate || 0) / 100) * (1 + (record.taxRate || 0) / 100);
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
        title={`销售单详情 - ${order.orderNo}`}
        extra={
          <Space>
            {order.status === 'draft' && (
              <Button type="primary" onClick={handleSubmit}>提交</Button>
            )}
            {order.status === 'pending' && (
              <Button type="primary" onClick={handleApprove}>审批</Button>
            )}
            {order.status === 'approved' && (
              <Button type="primary" onClick={handleShip}>出库</Button>
            )}
            <Button onClick={() => navigate('/sales')}>返回列表</Button>
          </Space>
        }
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="单据编号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="订单日期">{formatDate(order.orderDate)}</Descriptions.Item>
          <Descriptions.Item label="客户">{order.customer?.name}</Descriptions.Item>
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

        <Divider>销售明细</Divider>

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

export default SaleDetail;