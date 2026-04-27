import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  message,
  Modal,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { platformInventoryService } from '../../services';
import type { PlatformInventory } from '../../services';
import { formatDate } from '../../constants';

interface QueryParams {
  platform?: string;
  page?: number;
  pageSize?: number;
  sku?: string;
  productName?: string;
  warehouse?: string;
}

const CdInventoryList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<PlatformInventory[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState<PlatformInventory | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const [filters, setFilters] = useState({
    sku: undefined as string | undefined,
    productName: undefined as string | undefined,
    warehouse: undefined as string | undefined,
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: QueryParams = {
        platform: 'cd',
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (filters.sku) params.sku = filters.sku;
      if (filters.productName) params.productName = filters.productName;
      if (filters.warehouse) params.warehouse = filters.warehouse;

      const res = await platformInventoryService.findAll(params);
      setOrders(res.data.list);
      setPagination((prev) => ({
        ...prev,
        total: res.data.total,
      }));
    } catch {
      message.error('获取CD库存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchOrders();
  };

  const handleReset = () => {
    setFilters({
      sku: undefined,
      productName: undefined,
      warehouse: undefined,
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const showDetail = (order: PlatformInventory) => {
    setSelectedOrder(order);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 250,
      ellipsis: true,
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
    },
    {
      title: '可用',
      dataIndex: 'available',
      key: 'available',
      width: 80,
      align: 'right' as const,
    },
    {
      title: '预留',
      dataIndex: 'reserved',
      key: 'reserved',
      width: 80,
      align: 'right' as const,
    },
    {
      title: '总库存',
      dataIndex: 'total',
      key: 'total',
      width: 80,
      align: 'right' as const,
    },
    {
      title: '7日均单',
      dataIndex: 'avgUnitsOrdered7Days',
      key: 'avgUnitsOrdered7Days',
      width: 80,
      align: 'right' as const,
    },
    {
      title: '30日均单',
      dataIndex: 'avgUnitsOrdered30Days',
      key: 'avgUnitsOrdered30Days',
      width: 80,
      align: 'right' as const,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160,
      render: (time: string) => formatDate(time),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: PlatformInventory) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="CD 仓库库存"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
            刷新
          </Button>
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
          <Input
            placeholder="商品名称搜索"
            value={filters.productName}
            onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
            style={{ width: 200 }}
            allowClear
          />
          <Input
            placeholder="仓库搜索"
            value={filters.warehouse}
            onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
            style={{ width: 150 }}
            allowClear
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
        title="库存详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="SKU">{selectedOrder.sku}</Descriptions.Item>
            <Descriptions.Item label="SPU">{selectedOrder.spu}</Descriptions.Item>
            <Descriptions.Item label="仓库">{selectedOrder.warehouseName}</Descriptions.Item>
            <Descriptions.Item label="仓库ID">{selectedOrder.warehouseId}</Descriptions.Item>
            <Descriptions.Item label="商品名称" span={2}>{selectedOrder.productName}</Descriptions.Item>
            <Descriptions.Item label="品牌">{selectedOrder.brandName}</Descriptions.Item>
            <Descriptions.Item label="品类">{selectedOrder.categoryName}</Descriptions.Item>
            <Descriptions.Item label="可用库存">{selectedOrder.available}</Descriptions.Item>
            <Descriptions.Item label="预留">{selectedOrder.reserved}</Descriptions.Item>
            <Descriptions.Item label="总库存">{selectedOrder.total}</Descriptions.Item>
            <Descriptions.Item label="单位">{selectedOrder.unit}</Descriptions.Item>
            <Descriptions.Item label="7日均单">{selectedOrder.avgUnitsOrdered7Days}</Descriptions.Item>
            <Descriptions.Item label="15日均单">{selectedOrder.avgUnitsOrdered15Days}</Descriptions.Item>
            <Descriptions.Item label="30日均单">{selectedOrder.avgUnitsOrdered30Days}</Descriptions.Item>
            <Descriptions.Item label="单箱数量">{selectedOrder.singleQuantity}</Descriptions.Item>
            <Descriptions.Item label="采购交期">{selectedOrder.productDeliveryDays} 天</Descriptions.Item>
            <Descriptions.Item label="产品负责人">{selectedOrder.productManagerAccountName}</Descriptions.Item>
            <Descriptions.Item label="状态">{selectedOrder.statusName}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{formatDate(selectedOrder.updateTime)}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CdInventoryList;