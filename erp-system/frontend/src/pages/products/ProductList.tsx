import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, message, Modal, Image, Tabs, Tag, Descriptions, Card, Row, Col, Input, Alert, Badge, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { productService, platformProductService } from '../../services';
import type { PlatformProduct, ProductStatistics } from '../../services';
import ProductForm from './ProductForm';
import type { PageResult } from '../../types';
import { formatMoney, isActiveTag, formatDate } from '../../constants';
import { orderSocket } from '../../services/order.socket';

interface Product {
  id: string;
  name: string;
  productCode: string;
  barcode?: string;
  category?: { name: string };
  supplier?: { name: string };
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
  salesCount?: number;
}

const ProductList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('local');
  const [data, setData] = useState<Product[]>([]);
  const [mskuData, setMskuData] = useState<PlatformProduct[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [mskuPagination, setMskuPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mskuDetailVisible, setMskuDetailVisible] = useState(false);
  const [selectedMsku, setSelectedMsku] = useState<PlatformProduct | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [statistics, setStatistics] = useState<ProductStatistics | null>(null);
  const [mskuFilters, setMskuFilters] = useState({ sku: '', name: '' });

  const [, setLoading] = useState(false);

  const fetchData = useCallback(async (page = 1, pageSize = 50, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result: PageResult<Product> = await productService.getProducts({ page, pageSize });
      setData(result.list);
      setPagination({ current: page, pageSize, total: result.total });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '获取数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchMskuData = useCallback(async (page = 1, pageSize = 50, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const params: Record<string, string | number> = { page, pageSize };
      if (mskuFilters.sku) params.sku = mskuFilters.sku;
      if (mskuFilters.name) params.name = mskuFilters.name;
      const result = await platformProductService.findAll(params);
      setMskuData(result.list);
      setMskuPagination({ current: page, pageSize, total: result.total });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '获取积加商品失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mskuFilters]);

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await platformProductService.getStatistics();
      setStatistics(stats);
    } catch (e) {
      console.error('获取统计失败', e);
    }
  }, []);

  useEffect(() => {
    orderSocket.connect();
    orderSocket.on('connect', () => setIsConnected(true));
    orderSocket.on('disconnect', () => setIsConnected(false));
    orderSocket.on('product-update', (data: unknown) => {
      const syncData = data as { total?: number; added?: number };
      message.info(`积加商品同步完成，共 ${syncData.total || 0} 条，新增 ${syncData.added || 0} 条`);
      if (activeTab === 'msku') fetchMskuData();
      fetchStatistics();
    });
    return () => { orderSocket.disconnect(); };
  }, [activeTab, fetchMskuData, fetchStatistics]);

  useEffect(() => {
    if (activeTab === 'local') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    } else if (activeTab === 'msku') {
      fetchMskuData();
      fetchStatistics();
    }
  }, [activeTab, fetchData, fetchMskuData, fetchStatistics]);

  const handleRefresh = () => {
    if (activeTab === 'local') {
      fetchData(pagination.current, pagination.pageSize, true);
    } else {
      fetchMskuData(mskuPagination.current, mskuPagination.pageSize, true);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await platformProductService.sync();
      message.success(`同步完成，共 ${result.synced} 条，新增 ${result.added} 条`);
      fetchMskuData();
      fetchStatistics();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const handleEdit = (record: Product) => {
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      onOk: async () => {
        try {
          await productService.deleteProduct(id);
          message.success('删除成功');
          fetchData();
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          message.error(err.response?.data?.message || '删除失败');
        }
      },
    });
  };

  const handleView = (record: Product) => {
    setSelectedProduct(record);
    setDetailVisible(true);
  };

  const handleMskuView = (record: PlatformProduct) => {
    setSelectedMsku(record);
    setMskuDetailVisible(true);
  };

  const handleMskuSearch = () => {
    setMskuPagination(prev => ({ ...prev, current: 1 }));
    fetchMskuData(1, mskuPagination.pageSize);
  };

  const handleMskuReset = () => {
    setMskuFilters({ sku: '', name: '' });
    fetchMskuData(1, mskuPagination.pageSize);
  };

  const localColumns: ColumnsType<Product> = [
    { title: '图片', dataIndex: 'imageUrl', key: 'image', width: 80,
      render: (v) => v ? <Image width={40} height={40} src={v} style={{objectFit: 'cover'}} placeholder={<div style={{width: 40, height: 40, background: '#f0f0f0'}} />} /> : <div style={{width: 40, height: 40, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999'}}>无图</div> },
    { title: '商品编码', dataIndex: 'productCode', key: 'productCode', width: 120 },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: ['category', 'name'], key: 'category' },
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier' },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: '成本价', dataIndex: 'costPrice', key: 'costPrice', width: 90, render: formatMoney },
    { title: '销售价', dataIndex: 'salePrice', key: 'salePrice', width: 90, render: formatMoney },
    { title: '库存', dataIndex: 'stock', key: 'stock', width: 70 },
    { title: '销量', dataIndex: 'salesCount', key: 'salesCount', width: 70, render: (v) => v || 0 },
    { title: '状态', dataIndex: 'isActive', key: 'isActive', width: 70, render: isActiveTag },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleView(record)}>查看</Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const mskuColumns: ColumnsType<PlatformProduct> = [
    { title: '图片', dataIndex: 'smallImageUrl', key: 'image', width: 80,
      render: (v) => v ? <Image width={40} height={40} src={v} style={{objectFit: 'cover'}} placeholder={<div style={{width: 40, height: 40, background: '#f0f0f0'}} />} /> : <div style={{width: 40, height: 40, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999'}}>无图</div> },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 150, ellipsis: true },
    { title: '商品名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '品牌', dataIndex: 'brandName', key: 'brandName', width: 100 },
    { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 100 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: '采购交期', dataIndex: 'productDeliveryDays', key: 'productDeliveryDays', width: 80, render: (v) => v ? `${v}天` : '-' },
    { title: '产品状态', dataIndex: 'state', key: 'state', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag> },
    { title: '更新时间', dataIndex: 'lastDate', key: 'lastDate', width: 160, render: (v) => formatDate(v) },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleMskuView(record)}>详情</Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'local',
      label: '本地商品',
      children: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>本地商品管理</h3>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>刷新</Button>
              <Button type="primary" onClick={() => { setEditingId(undefined); setModalVisible(true); }}>
                新增商品
              </Button>
            </Space>
          </div>
          <Table
            columns={localColumns}
            dataSource={data}
            loading={refreshing}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => fetchData(page, pageSize),
            }}
          />
        </>
      ),
    },
    {
      key: 'msku',
      label: (
        <Space>
          积加商品(MSKU)
          <Badge status={isConnected ? 'success' : 'error'} />
        </Space>
      ),
      children: (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={4}><Card><Statistic title="商品总数" value={statistics?.total || 0} /></Card></Col>
            <Col span={4}><Card><Statistic title="启用状态" value={statistics?.activeTotal || 0} /></Card></Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="最后同步"
                  value={statistics?.lastSyncTime ? formatDate(statistics.lastSyncTime) : '从未同步'}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ fontSize: 14 }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  {statistics?.isSyncing && <Alert message="同步中..." type="info" showIcon icon={<SyncOutlined spin />} style={{ marginRight: 8 }} />}
                  <Button icon={<SyncOutlined />} onClick={handleSync} loading={syncing}>同步积加商品</Button>
                  <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>刷新</Button>
                </Space>
              </Card>
            </Col>
          </Row>

          <Card style={{ marginBottom: 16 }}>
            <Space wrap>
              <Input
                placeholder="SKU搜索"
                value={mskuFilters.sku}
                onChange={(e) => setMskuFilters({ ...mskuFilters, sku: e.target.value })}
                style={{ width: 150 }}
                allowClear
              />
              <Input
                placeholder="商品名称搜索"
                value={mskuFilters.name}
                onChange={(e) => setMskuFilters({ ...mskuFilters, name: e.target.value })}
                style={{ width: 200 }}
                allowClear
              />
              <Button type="primary" onClick={handleMskuSearch}>搜索</Button>
              <Button onClick={handleMskuReset}>重置</Button>
            </Space>
          </Card>

          <Table
            columns={mskuColumns}
            dataSource={mskuData}
            loading={refreshing}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              ...mskuPagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => fetchMskuData(page, pageSize),
            }}
          />
        </>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      <Modal
        title="编辑商品"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <ProductForm
          id={editingId}
          onSuccess={() => { setModalVisible(false); fetchData(); }}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>

      <Modal
        title="商品详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>关闭</Button>}
        width={700}
      >
        {selectedProduct && (
          <div>
            <div style={{ display: 'flex', gap: 24 }}>
              {selectedProduct.imageUrl && (
                <Image width={200} height={200} src={selectedProduct.imageUrl} style={{ objectFit: 'contain', background: '#f5f5f5' }} />
              )}
              <div style={{ flex: 1 }}>
                <p><strong>商品名称：</strong>{selectedProduct.name}</p>
                <p><strong>商品编码：</strong>{selectedProduct.productCode}</p>
                <p><strong>条形码：</strong>{selectedProduct.barcode || '-'}</p>
                <p><strong>分类：</strong>{selectedProduct.category?.name || '-'}</p>
                <p><strong>供应商：</strong>{selectedProduct.supplier?.name || '-'}</p>
                <p><strong>单位：</strong>{selectedProduct.unit}</p>
                <p><strong>成本价：</strong>{formatMoney(selectedProduct.costPrice)}</p>
                <p><strong>销售价：</strong>{formatMoney(selectedProduct.salePrice)}</p>
                <p><strong>当前库存：</strong>{selectedProduct.stock}</p>
                <p><strong>状态：</strong>{isActiveTag(selectedProduct.isActive)}</p>
              </div>
            </div>
            {selectedProduct.description && (
              <div style={{ marginTop: 16 }}>
                <strong>商品描述：</strong>
                <p style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>{selectedProduct.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="积加商品详情"
        open={mskuDetailVisible}
        onCancel={() => setMskuDetailVisible(false)}
        footer={<Button onClick={() => setMskuDetailVisible(false)}>关闭</Button>}
        width={800}
      >
        {selectedMsku && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="SKU" span={2}>{selectedMsku.sku}</Descriptions.Item>
            <Descriptions.Item label="商品名称" span={2}>{selectedMsku.name}</Descriptions.Item>
            <Descriptions.Item label="商品简称">{selectedMsku.briefName || '-'}</Descriptions.Item>
            <Descriptions.Item label="品牌">{selectedMsku.brandName || '-'}</Descriptions.Item>
            <Descriptions.Item label="分类">{selectedMsku.categoryName || '-'}</Descriptions.Item>
            <Descriptions.Item label="产品类型">{selectedMsku.productTypeName || '-'}</Descriptions.Item>
            <Descriptions.Item label="单位">{selectedMsku.unit}</Descriptions.Item>
            <Descriptions.Item label="采购交期">{selectedMsku.productDeliveryDays ? `${selectedMsku.productDeliveryDays}天` : '-'}</Descriptions.Item>
            <Descriptions.Item label="产品负责人">{selectedMsku.productManagerAccount || '-'}</Descriptions.Item>
            <Descriptions.Item label="采购负责人">{selectedMsku.purchaseAccount || '-'}</Descriptions.Item>
            <Descriptions.Item label="产品状态">{selectedMsku.state === 1 ? '启用' : '停用'}</Descriptions.Item>
            <Descriptions.Item label="产品等级">{selectedMsku.levelName || '-'}</Descriptions.Item>
            <Descriptions.Item label="海关编码">{selectedMsku.customsCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="中文报关名">{selectedMsku.chineseCustomsName || '-'}</Descriptions.Item>
            <Descriptions.Item label="英文报关名">{selectedMsku.englishCustomsName || '-'}</Descriptions.Item>
            <Descriptions.Item label="材质">{selectedMsku.material || '-'}</Descriptions.Item>
            <Descriptions.Item label="包装尺寸">{selectedMsku.packageL} x {selectedMsku.packageW} x {selectedMsku.packageH}</Descriptions.Item>
            <Descriptions.Item label="单品尺寸">{selectedMsku.singleProductSizeL} x {selectedMsku.singleProductSizeW} x {selectedMsku.singleProductSizeH}</Descriptions.Item>
            <Descriptions.Item label="单品毛重">{selectedMsku.packageWeight}g</Descriptions.Item>
            <Descriptions.Item label="带电属性">{selectedMsku.batteryAttribute || '-'}</Descriptions.Item>
            <Descriptions.Item label="液体属性">{selectedMsku.liquidAttribute || '-'}</Descriptions.Item>
            <Descriptions.Item label="带磁属性">{selectedMsku.magneticAttribute || '-'}</Descriptions.Item>
            <Descriptions.Item label="纯电属性">{selectedMsku.chargedAttribute || '-'}</Descriptions.Item>
            <Descriptions.Item label="粉末属性">{selectedMsku.powderAttribute || '-'}</Descriptions.Item>
            <Descriptions.Item label="木制属性">{selectedMsku.woodenAttribute || '-'}</Descriptions.Item>
            <Descriptions.Item label="商检">{selectedMsku.isInspection === 1 ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="服装类">{selectedMsku.clothing === 1 ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{formatDate(selectedMsku.addDate)}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{formatDate(selectedMsku.lastDate)}</Descriptions.Item>
            <Descriptions.Item label="组合规则" span={2}>{selectedMsku.assembly || '-'}</Descriptions.Item>
            <Descriptions.Item label="包材规则" span={2}>{selectedMsku.assemblyPackage || '-'}</Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{selectedMsku.description || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;