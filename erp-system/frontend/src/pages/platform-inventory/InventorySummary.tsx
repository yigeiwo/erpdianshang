import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Space,
  Tag,
  message,
  Alert,
  Statistic,
  Badge,
} from 'antd';
import {
  SyncOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { platformInventoryService } from '../../services';
import type { WarehouseSummary, InventoryStatistics } from '../../services';
import { orderSocket } from '../../services/order.socket';

const InventorySummary: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statistics, setStatistics] = useState<InventoryStatistics | null>(null);
  const [warehouseSummary, setWarehouseSummary] = useState<WarehouseSummary[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stats, summary] = await Promise.all([
        platformInventoryService.getStatistics(),
        platformInventoryService.getWarehouseSummary(),
      ]);
      setStatistics(stats);
      setWarehouseSummary(summary);
    } catch {
      message.error('获取库存统计失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await platformInventoryService.sync();
      message.success(`同步完成，共同步 ${result.synced} 条`);
      fetchData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '同步失败');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    orderSocket.connect();
    orderSocket.on('connect', () => setIsConnected(true));
    orderSocket.on('disconnect', () => setIsConnected(false));

    orderSocket.on('inventory-update', (data: unknown) => {
      const syncData = data as { total?: number };
      message.info(`库存同步完成，共 ${syncData.total || 0} 条更新`);
      fetchData();
    });

    return () => {
      orderSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const formatLastSyncTime = (isoString: string | null | undefined) => {
    if (!isoString) return '从未同步';
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    return date.toLocaleString('zh-CN');
  };

  const columns = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (text: string) => (
        <Tag color={text === 'cd' ? 'blue' : 'green'}>
          {text === 'cd' ? 'CD' : 'EMAG'}
        </Tag>
      ),
    },
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'SKU数量',
      dataIndex: 'skuCount',
      key: 'skuCount',
      align: 'right' as const,
    },
    {
      title: '可用库存',
      dataIndex: 'available',
      key: 'available',
      align: 'right' as const,
    },
    {
      title: '总库存',
      dataIndex: 'total',
      key: 'total',
      align: 'right' as const,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, justifyContent: 'flex-end', width: '100%' }}>
        <Badge status={isConnected ? 'success' : 'error'} text={isConnected ? '实时连接' : '离线'} />
        <WifiOutlined style={{ color: isConnected ? '#52c41a' : '#ff4d4f' }} />
      </Space>

      {statistics?.isSyncing && (
        <Alert
          message="正在同步库存..."
          type="info"
          showIcon
          icon={<SyncOutlined spin />}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="CD 仓库 SKU 数" value={statistics?.cdTotal || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="EMAG 仓库 SKU 数" value={statistics?.emagTotal || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="CD 可用库存" value={statistics?.cdAvailable || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="EMAG 可用库存" value={statistics?.emagAvailable || 0} />
          </Card>
        </Col>
      </Row>

      <Card
        title="库存汇总"
        extra={
          <Space>
            <Statistic
              title=""
              value={formatLastSyncTime(statistics?.lastSyncTime)}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: 14 }}
            />
            <Button icon={<SyncOutlined />} onClick={handleSync} loading={syncing}>
              同步库存
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={warehouseSummary}
          rowKey={(record) => `${record.platform}-${record.warehouseName}`}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default InventorySummary;