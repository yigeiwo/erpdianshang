import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Empty, Card, Row, Col, Statistic, Tabs, List, Typography, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { purchaseService, saleService } from '../../services';
import { FileTextOutlined, ShoppingOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface UnifiedOrder {
  id: string;
  orderNo: string;
  type: 'purchase' | 'sale';
  status: string;
  totalAmount: number;
  finalAmount: number;
  itemCount: number;
  orderDate: string;
  remark?: string;
  supplierName?: string;
  customerName?: string;
  warehouseName?: string;
  creatorName?: string;
  items?: any[];
}

const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'orange', text: '待审批' },
  approved: { color: 'blue', text: '已审批' },
  rejected: { color: 'red', text: '已拒绝' },
  in_progress: { color: 'processing', text: '进行中' },
  completed: { color: 'green', text: '已完成' },
  cancelled: { color: 'default', text: '已取消' },
};

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<UnifiedOrder[]>([]);
  const [saleOrders, setSaleOrders] = useState<UnifiedOrder[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        purchaseService.getPurchases({ page: 1, pageSize: 100 }),
        saleService.getSales({ page: 1, pageSize: 100 }),
      ]);

      const purchaseData: UnifiedOrder[] = (pRes.list as any[]).map((item: any) => ({
        id: item.id,
        orderNo: item.orderNo,
        type: 'purchase',
        status: item.status,
        totalAmount: item.totalAmount,
        finalAmount: item.finalAmount,
        itemCount: item.items?.length || 0,
        orderDate: item.orderDate,
        remark: item.remark,
        supplierName: item.supplier?.name,
        customerName: undefined,
        warehouseName: item.warehouse?.name,
        creatorName: item.creator?.realName,
        items: item.items,
      }));

      const saleData: UnifiedOrder[] = (sRes.list as any[]).map((item: any) => ({
        id: item.id,
        orderNo: item.orderNo,
        type: 'sale',
        status: item.status,
        totalAmount: item.totalAmount,
        finalAmount: item.finalAmount,
        itemCount: item.items?.length || 0,
        orderDate: item.orderDate,
        remark: item.remark,
        supplierName: undefined,
        customerName: item.customer?.name,
        warehouseName: item.warehouse?.name,
        creatorName: item.creator?.realName,
        items: item.items,
      }));

      setPurchaseOrders(purchaseData);
      setSaleOrders(saleData);
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'purchase':
        return purchaseOrders;
      case 'sale':
        return saleOrders;
      default:
        return [...purchaseOrders, ...saleOrders].sort((a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
    }
  };

  const handleGoDetail = (record: UnifiedOrder) => {
    if (record.type === 'purchase') {
      navigate(`/purchases/${record.id}`);
    } else {
      navigate(`/sales/${record.id}`);
    }
  };

  const getTypeTag = (type: string) => {
    return type === 'purchase'
      ? <Tag icon={<ShoppingCartOutlined />} color="blue">采购</Tag>
      : <Tag icon={<ShoppingOutlined />} color="green">销售</Tag>;
  };

  const columns: ColumnsType<UnifiedOrder> = [
    {
      title: '订单信息',
      key: 'orderInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.orderNo}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.orderDate?.split('T')[0] || record.orderDate}
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (v) => getTypeTag(v),
    },
    {
      title: '交易对象',
      key: 'target',
      width: 120,
      render: (_, record) => (
        <span>{record.supplierName || record.customerName || '-'}</span>
      ),
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 100,
    },
    {
      title: '商品数量',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (v) => `${v} 种`,
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 110,
      render: (v) => <span style={{ color: '#1890ff' }}>¥{Number(v || 0).toFixed(2)}</span>,
    },
    {
      title: '实付金额',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      width: 110,
      render: (v) => <strong>¥{Number(v || 0).toFixed(2)}</strong>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v) => {
        const status = statusMap[v] || { color: 'default', text: v };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleGoDetail(record)}>
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  const allOrders = [...purchaseOrders, ...saleOrders];
  const totalAmount = allOrders.reduce((sum, o) => sum + Number(o.finalAmount || 0), 0);
  const completedAmount = allOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.finalAmount || 0), 0);

  const orderTabItems = [
    {
      key: 'all',
      label: `全部订单 (${allOrders.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={getFilteredOrders()}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          locale={{ emptyText: <Empty description="暂无订单" /> }}
        />
      ),
    },
    {
      key: 'purchase',
      label: `采购订单 (${purchaseOrders.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={purchaseOrders}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          locale={{ emptyText: <Empty description="暂无采购订单" /> }}
        />
      ),
    },
    {
      key: 'sale',
      label: `销售订单 (${saleOrders.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={saleOrders}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          locale={{ emptyText: <Empty description="暂无销售订单" /> }}
        />
      ),
    },
  ];

  return (
    <div>
      <h2>订单管理</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="订单总数"
              value={allOrders.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="订单总额"
              value={totalAmount}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成金额"
              value={completedAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="待处理订单"
              value={allOrders.filter((o) => ['draft', 'pending', 'approved'].includes(o.status)).length}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={orderTabItems}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedOrder(null);
        }}
        footer={
          <Space>
            <Button onClick={() => setDetailVisible(false)}>关闭</Button>
            <Button type="primary" onClick={() => {
              if (selectedOrder) handleGoDetail(selectedOrder);
            }}>
              进入详情页
            </Button>
          </Space>
        }
        width={800}
      >
        {selectedOrder && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>订单编号：</Text> {selectedOrder.orderNo}
              </Col>
              <Col span={12}>
                <Text strong>订单日期：</Text> {selectedOrder.orderDate?.split('T')[0]}
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>类型：</Text> {getTypeTag(selectedOrder.type)}
              </Col>
              <Col span={8}>
                <Text strong>{selectedOrder.type === 'purchase' ? '供应商' : '客户'}：</Text>
                {selectedOrder.supplierName || selectedOrder.customerName}
              </Col>
              <Col span={8}>
                <Text strong>仓库：</Text> {selectedOrder.warehouseName}
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>订单金额：</Text> ¥{Number(selectedOrder.totalAmount || 0).toFixed(2)}
              </Col>
              <Col span={8}>
                <Text strong>实付金额：</Text>
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                  ¥{Number(selectedOrder.finalAmount || 0).toFixed(2)}
                </span>
              </Col>
              <Col span={8}>
                <Text strong>状态：</Text>
                <Tag color={statusMap[selectedOrder.status]?.color}>
                  {statusMap[selectedOrder.status]?.text}
                </Tag>
              </Col>
            </Row>
            {selectedOrder.remark && (
              <>
                <Divider />
                <div>
                  <Text strong>备注：</Text> {selectedOrder.remark}
                </div>
              </>
            )}
            <Divider />
            <Text strong>订单明细：</Text>
            <List
              size="small"
              bordered
              dataSource={selectedOrder.items || []}
              renderItem={(item: any) => (
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>
                      {item.product?.name || item.product?.productCode || '商品'}
                      {selectedOrder.type === 'purchase' ? '' : ` × ${item.quantity}`}
                    </span>
                    <span>
                      {selectedOrder.type === 'purchase'
                        ? `¥${Number(item.costPrice || 0).toFixed(2)} × ${item.quantity}`
                        : `¥${Number(item.salePrice || 0).toFixed(2)} × ${item.quantity}`
                      }
                    </span>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;