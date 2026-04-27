import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag, Card, Row, Col, Statistic, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { ReloadOutlined, FileTextOutlined, ShoppingOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { purchaseService, saleService, type PurchaseOrder, type SaleOrder } from '../../services';
import { statusMap, formatMoney, formatDate } from '../../constants';

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
  items?: unknown[];
}

const getTypeTag = (type: string) => {
  return type === 'purchase'
    ? <Tag icon={<ShoppingCartOutlined />} color="blue">采购</Tag>
    : <Tag icon={<ShoppingOutlined />} color="green">销售</Tag>;
};

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<UnifiedOrder[]>([]);
  const [saleOrders, setSaleOrders] = useState<UnifiedOrder[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      const [pRes, sRes] = await Promise.all([
        purchaseService.getPurchases({ page: 1, pageSize: 100 }),
        saleService.getSales({ page: 1, pageSize: 100 }),
      ]);

      const purchaseData: UnifiedOrder[] = (pRes.list as PurchaseOrder[]).map((item) => ({
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
        warehouseName: item.warehouse?.name,
        creatorName: item.creator?.realName,
        items: item.items,
      }));

      const saleData: UnifiedOrder[] = (sRes.list as SaleOrder[]).map((item) => ({
        id: item.id,
        orderNo: item.orderNo,
        type: 'sale',
        status: item.status,
        totalAmount: item.totalAmount,
        finalAmount: item.finalAmount,
        itemCount: item.items?.length || 0,
        orderDate: item.orderDate,
        remark: item.remark,
        customerName: item.customer?.name,
        warehouseName: item.warehouse?.name,
        creatorName: item.creator?.realName,
        items: item.items,
      }));

      setPurchaseOrders(purchaseData);
      setSaleOrders(saleData);
    } catch (error: unknown) {
      console.error('获取订单失败:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    fetchOrders();
  };

  const handleGoDetail = (record: UnifiedOrder) => {
    if (record.type === 'purchase') {
      navigate(`/purchases/${record.id}`);
    } else {
      navigate(`/sales/${record.id}`);
    }
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'purchase':
        return purchaseOrders;
      case 'sale':
        return saleOrders;
      default:
        return [...purchaseOrders, ...saleOrders].sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
    }
  };

  const columns: ColumnsType<UnifiedOrder> = [
    {
      title: '订单信息',
      key: 'orderInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.orderNo}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{formatDate(record.orderDate)}</div>
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
      render: (_, record) => <span>{record.supplierName || record.customerName || '-'}</span>,
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
      render: (v) => <span style={{ color: '#1890ff' }}>{formatMoney(v)}</span>,
    },
    {
      title: '实付金额',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      width: 110,
      render: (v) => <strong>{formatMoney(v)}</strong>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => {
        const status = statusMap[v] || { color: 'default', text: v };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleGoDetail(record)}>
          查看详情
        </Button>
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
          loading={refreshing}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
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
          loading={refreshing}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
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
          loading={refreshing}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>订单管理</h2>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>
          刷新
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="订单总数" value={allOrders.length} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="订单总额" value={totalAmount} precision={2} prefix="¥" />
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
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={orderTabItems} />
      </Card>
    </div>
  );
};

export default OrderList;