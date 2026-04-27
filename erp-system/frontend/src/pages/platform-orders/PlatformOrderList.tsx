import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  message,
  Modal,
  Descriptions,
  Row,
  Col,
  Alert,
  Statistic,
  Badge,
} from 'antd';
import {
  SyncOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { platformOrderService } from '../../services';
import type { PlatformOrder, PlatformOrderStatistics, QueryPlatformOrderParams } from '../../services';
import { formatMoney, formatDate } from '../../constants';
import { orderSocket } from '../../services/order.socket';

const { RangePicker } = DatePicker;

const PlatformOrderList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [orders, setOrders] = useState<PlatformOrder[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [statistics, setStatistics] = useState<PlatformOrderStatistics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PlatformOrder | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const [filters, setFilters] = useState({
    orderStatus: undefined as string | undefined,
    sku: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const fetchStatistics = async () => {
    try {
      const data = await platformOrderService.getStatistics();
      setStatistics(data);
    } catch {
      console.error('获取统计失败');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: QueryPlatformOrderParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (filters.orderStatus) params.orderStatus = filters.orderStatus;
      if (filters.sku) params.sku = filters.sku;
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      const res = await platformOrderService.findAll(params);
      setOrders(res.data.list);
      setPagination((prev) => ({
        ...prev,
        total: res.data.total,
      }));
    } catch {
      message.error('获取平台订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const data = await platformOrderService.syncFromJiJia({
        backtrackDays: 7,
      });
      message.success(`同步完成，共同步 ${data.synced} 条订单`);
      fetchOrders();
      fetchStatistics();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchOrders();
  };

  const handleReset = () => {
    setFilters({
      orderStatus: undefined,
      sku: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchOrders();
  };

  const handleTableChange = (pag: { current?: number; pageSize?: number }) => {
    setPagination((prev) => ({
      ...prev,
      current: pag.current ?? prev.current,
      pageSize: pag.pageSize ?? prev.pageSize,
    }));
    fetchOrders();
  };

  useEffect(() => {
    orderSocket.connect();

    orderSocket.on('connect', () => setIsConnected(true));
    orderSocket.on('disconnect', () => setIsConnected(false));

    orderSocket.on('sync-complete', (data: unknown) => {
      const syncData = data as { total?: number };
      message.info(`自动同步完成，新增 ${syncData.total || 0} 条订单`);
      fetchStatistics();
      if (pagination.current === 1) {
        fetchOrders();
      } else {
        setNewOrdersCount((prev) => prev + (syncData.total || 0));
      }
    });

    orderSocket.on('new-orders', (data: unknown) => {
      const newOrdersData = data as { orders?: unknown[] };
      setNewOrdersCount((prev) => prev + (newOrdersData.orders?.length || 0));
    });

    return () => {
      orderSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDetail = (order: PlatformOrder) => {
    setSelectedOrder(order);
    setDetailVisible(true);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const formatLastSyncTime = (isoString: string | null | undefined) => {
    if (!isoString) return '从未同步';
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `刚刚`;
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    return formatDate(isoString);
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'platformOrderId',
      key: 'platformOrderId',
      width: 150,
      ellipsis: true,
    },
    {
      title: '订单行号',
      dataIndex: 'platformOrderLineId',
      key: 'platformOrderLineId',
      width: 150,
      ellipsis: true,
    },
    {
      title: '下单时间',
      dataIndex: 'orderingTime',
      key: 'orderingTime',
      width: 160,
      render: (time: string) => formatDate(time),
    },
    {
      title: '店铺',
      dataIndex: 'erpShopName',
      key: 'erpShopName',
      width: 120,
    },
    {
      title: '站点',
      dataIndex: 'regionCnName',
      key: 'regionCnName',
      width: 80,
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatusName',
      key: 'orderStatusName',
      width: 100,
      render: (text: string, record: PlatformOrder) => {
        const colorMap: Record<string, string> = {
          '待付款': 'orange',
          '已付款': 'blue',
          '已发货': 'green',
          '已完成': 'green',
          '已取消': 'red',
          '退款中': 'orange',
          '已退款': 'red',
        };
        return <Tag color={colorMap[text] || 'default'}>{text || record.orderStatus}</Tag>;
      },
    },
    {
      title: '买家',
      dataIndex: 'buyerAccountName',
      key: 'buyerAccountName',
      width: 100,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      ellipsis: true,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '数量',
      dataIndex: 'buyQuantity',
      key: 'buyQuantity',
      width: 60,
      align: 'right' as const,
    },
    {
      title: '单价',
      dataIndex: 'productUnitPrice',
      key: 'productUnitPrice',
      width: 100,
      align: 'right' as const,
      render: (price: number) => formatMoney(price),
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      align: 'right' as const,
      render: (amount: number) => formatMoney(amount),
    },
    {
      title: '追踪号',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      width: 120,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: PlatformOrder) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, justifyContent: 'flex-end', width: '100%' }}>
        <Badge status={isConnected ? 'success' : 'error'} text={isConnected ? '实时连接' : '离线'} />
        <WifiOutlined style={{ color: isConnected ? '#52c41a' : '#ff4d4f' }} />
      </Space>

      {newOrdersCount > 0 && (
        <Alert
          message={`有 ${newOrdersCount} 条新订单`}
          description="点击查看新订单加载最新数据"
          type="info"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => { fetchOrders(); setNewOrdersCount(0); }}>
              查看新订单
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {statistics?.isSyncing && (
        <Alert
          message="正在同步中..."
          type="info"
          showIcon
          icon={<SyncOutlined spin />}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="平台订单总数" value={statistics?.totalOrders || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日订单" value={statistics?.todayOrders || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="订单总金额" value={statistics?.totalAmount || 0} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最后同步"
              value={formatLastSyncTime(statistics?.lastSyncTime)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="平台订单管理"
        extra={
          <Space>
            <Button icon={<SyncOutlined />} onClick={handleSync} loading={syncing}>
              同步积加订单
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
              刷新
            </Button>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="SKU搜索"
            value={filters.sku}
            onChange={(e) => setFilters({ ...filters, sku: e.target.value })}
            style={{ width: 150 }}
            allowClear
          />
          <Select
            placeholder="订单状态"
            value={filters.orderStatus}
            onChange={(v) => setFilters({ ...filters, orderStatus: v })}
            style={{ width: 120 }}
            allowClear
            options={[
              { label: '待付款', value: 'pending' },
              { label: '已付款', value: 'paid' },
              { label: '已发货', value: 'shipped' },
              { label: '已完成', value: 'completed' },
              { label: '已取消', value: 'cancelled' },
            ]}
          />
          <RangePicker
            onChange={(_, dateStrings) => {
              setFilters({
                ...filters,
                startDate: dateStrings[0] || undefined,
                endDate: dateStrings[1] || undefined,
              });
            }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="平台订单号">{selectedOrder.platformOrderId}</Descriptions.Item>
            <Descriptions.Item label="订单行号">{selectedOrder.platformOrderLineId}</Descriptions.Item>
            <Descriptions.Item label="店铺">{selectedOrder.erpShopName}</Descriptions.Item>
            <Descriptions.Item label="站点">{selectedOrder.regionCnName}</Descriptions.Item>
            <Descriptions.Item label="订单状态">{selectedOrder.orderStatusName}</Descriptions.Item>
            <Descriptions.Item label="下单时间">{formatDate(selectedOrder.orderingTime)}</Descriptions.Item>
            <Descriptions.Item label="付款时间">{formatDate(selectedOrder.paymentTime)}</Descriptions.Item>
            <Descriptions.Item label="买家">{selectedOrder.buyerAccountName}</Descriptions.Item>
            <Descriptions.Item label="SKU">{selectedOrder.sku}</Descriptions.Item>
            <Descriptions.Item label="MSKU">{selectedOrder.msku}</Descriptions.Item>
            <Descriptions.Item label="商品名称" span={2}>{selectedOrder.productName}</Descriptions.Item>
            <Descriptions.Item label="单价">{formatMoney(selectedOrder.productUnitPrice)}</Descriptions.Item>
            <Descriptions.Item label="数量">{selectedOrder.buyQuantity}</Descriptions.Item>
            <Descriptions.Item label="订单金额">{formatMoney(selectedOrder.totalAmount)}</Descriptions.Item>
            <Descriptions.Item label="买家实付">{formatMoney(selectedOrder.buyerPayAmount)}</Descriptions.Item>
            <Descriptions.Item label="收件人">{selectedOrder.receiverName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selectedOrder.receiverPhone}</Descriptions.Item>
            <Descriptions.Item label="手机">{selectedOrder.receiverMobilePhone}</Descriptions.Item>
            <Descriptions.Item label="国家">{selectedOrder.receiverCountry}</Descriptions.Item>
            <Descriptions.Item label="省份">{selectedOrder.receiverState}</Descriptions.Item>
            <Descriptions.Item label="城市">{selectedOrder.receiverCity}</Descriptions.Item>
            <Descriptions.Item label="详细地址" span={2}>{selectedOrder.receiverAddressDetail1} {selectedOrder.receiverAddressDetail2}</Descriptions.Item>
            <Descriptions.Item label="邮编">{selectedOrder.receiverPostCode}</Descriptions.Item>
            <Descriptions.Item label="追踪号">{selectedOrder.trackingNumber}</Descriptions.Item>
            <Descriptions.Item label="买家留言" span={2}>{selectedOrder.buyerMessage || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PlatformOrderList;