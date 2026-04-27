import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Select, Space, message } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { analyticsService, platformOrderService, platformInventoryService, platformProductService } from '../../services';
import type { DashboardStats, SalesTrend, CategorySales } from '../../services/analytics.service';

interface PlatformOrderStats {
  totalOrders: number;
  todayOrders: number;
  totalAmount: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

interface PlatformInventoryStats {
  cdTotal: number;
  emagTotal: number;
  cdAvailable: number;
  emagAvailable: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

interface PlatformProductStats {
  total: number;
  activeTotal: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

interface PlatformStats {
  orderStats: PlatformOrderStats;
  inventoryStats: PlatformInventoryStats;
  productStats: PlatformProductStats;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardType, setDashboardType] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    pendingPurchases: 0,
    completedPurchases: 0,
    pendingSales: 0,
    completedSales: 0,
    monthlyPurchases: 0,
    monthlySales: 0,
    yearlyPurchases: 0,
    yearlySales: 0,
  });
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<CategorySales[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [dashboardData, trendData, categoryData] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getSalesTrend(30),
        analyticsService.getSalesByCategory(),
      ]);
      setStats(dashboardData);
      setSalesTrend(trendData);
      setSalesByCategory(categoryData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      message.error('获取仪表盘数据失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformStats = async () => {
    setPlatformLoading(true);
    try {
      const [orderStats, inventoryStats, productStats] = await Promise.all([
        platformOrderService.getStatistics().catch(() => ({ totalOrders: 0, todayOrders: 0, totalAmount: 0, lastSyncTime: null, isSyncing: false })),
        platformInventoryService.getStatistics().catch(() => ({ cdTotal: 0, emagTotal: 0, cdAvailable: 0, emagAvailable: 0, lastSyncTime: null, isSyncing: false })),
        platformProductService.getStatistics().catch(() => ({ total: 0, activeTotal: 0, lastSyncTime: null, isSyncing: false })),
      ]);
      setPlatformStats({ orderStats, inventoryStats, productStats });
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
    } finally {
      setPlatformLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
    if (dashboardType === 'platform') {
      fetchPlatformStats();
    }
  }, [dashboardType]);

  const salesOption = {
    title: { text: '销售趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: salesTrend.map((s) => s.date),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '销售额',
        type: 'line',
        data: salesTrend.map((s) => s.amount),
        smooth: true,
        areaStyle: { opacity: 0.3 },
      },
    ],
  };

  const categoryOption = {
    title: { text: '商品分类销售占比', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '销售额',
        type: 'pie',
        radius: '60%',
        data: salesByCategory.map((c) => ({
          value: c.amount,
          name: c.category,
        })),
      },
    ],
  };

  const profit = stats.monthlySales - stats.monthlyPurchases;
  const profitRate = stats.monthlySales > 0 ? (profit / stats.monthlySales) * 100 : 0;

  const dashboardOptions = [
    { value: 'overview', label: '综合看板', icon: <AppstoreOutlined /> },
    { value: 'sales', label: '销售看板', icon: <DollarOutlined /> },
    { value: 'purchase', label: '采购看板', icon: <ShoppingCartOutlined /> },
    { value: 'inventory', label: '库存看板', icon: <ShoppingOutlined /> },
    { value: 'platform', label: '平台数据看板', icon: <BarChartOutlined /> },
  ];

  const renderOverviewDashboard = () => (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Card loading={loading} hoverable onClick={() => navigate('/sales')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="本月销售额"
              value={stats.monthlySales}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading} hoverable onClick={() => navigate('/purchases')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="本月采购额"
              value={stats.monthlyPurchases}
              precision={2}
              prefix={<ShoppingCartOutlined />}
              suffix="元"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="本月利润"
              value={profit}
              precision={2}
              prefix={profit >= 0 ? <RiseOutlined /> : <FallOutlined />}
              suffix="元"
              valueStyle={{ color: profit >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="利润率"
              value={profitRate}
              precision={2}
              suffix="%"
              valueStyle={{ color: profitRate >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card loading={loading} title="待处理业务" hoverable onClick={() => navigate('/purchases')} style={{ cursor: 'pointer' }}>
            <Statistic title="待审批采购单" value={stats.pendingPurchases} />
            <Statistic title="待审批销售单" value={stats.pendingSales} />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading} title="库存预警" hoverable onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
            <Statistic title="商品总数" value={stats.totalProducts} />
            <Statistic title="低库存商品" value={stats.lowStockProducts} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading} title="年度汇总" hoverable onClick={() => navigate('/sales')} style={{ cursor: 'pointer' }}>
            <Statistic title="年度销售额" value={stats.yearlySales} precision={2} suffix="元" />
            <Statistic title="年度采购额" value={stats.yearlyPurchases} precision={2} suffix="元" />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={16}>
          <Card>
            <ReactECharts option={salesOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <ReactECharts option={categoryOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderSalesDashboard = () => (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/sales')} style={{ cursor: 'pointer' }}>
            <Statistic title="本月销售额" value={stats.monthlySales} precision={2} prefix={<DollarOutlined />} suffix="元" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月利润" value={profit} precision={2} prefix={profit >= 0 ? <RiseOutlined /> : <FallOutlined />} suffix="元" valueStyle={{ color: profit >= 0 ? '#3f8600' : '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="利润率" value={profitRate} precision={2} suffix="%" valueStyle={{ color: profitRate >= 0 ? '#3f8600' : '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/sales')}>
            <Statistic title="待审批销售单" value={stats.pendingSales} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="年度销售汇总">
            <Row gutter={16}>
              <Col span={12}><Statistic title="年度销售额" value={stats.yearlySales} precision={2} suffix="元" /></Col>
              <Col span={12}><Statistic title="年度销售单数" value={stats.completedSales} /></Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="分类销售统计">
            <ReactECharts option={categoryOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="销售趋势">
            <ReactECharts option={salesOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderPurchaseDashboard = () => (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/purchases')} style={{ cursor: 'pointer' }}>
            <Statistic title="本月采购额" value={stats.monthlyPurchases} precision={2} prefix={<ShoppingCartOutlined />} suffix="元" valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/purchases')}>
            <Statistic title="待审批采购单" value={stats.pendingPurchases} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成采购单" value={stats.completedPurchases} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="年度采购额" value={stats.yearlyPurchases} precision={2} suffix="元" />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="采购分析">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="本月采购额" value={stats.monthlyPurchases} precision={2} suffix="元" />
              </Col>
              <Col span={8}>
                <Statistic title="月度平均采购" value={stats.yearlyPurchases / 12} precision={2} suffix="元" />
              </Col>
              <Col span={8}>
                <Statistic title="年度采购额" value={stats.yearlyPurchases} precision={2} suffix="元" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="采购待办">
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="待审批采购单">
                  <Statistic title="数量" value={stats.pendingPurchases} valueStyle={{ color: '#faad14' }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="已完成采购单">
                  <Statistic title="数量" value={stats.completedPurchases} valueStyle={{ color: '#3f8600' }} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderInventoryDashboard = () => (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
            <Statistic title="商品总数" value={stats.totalProducts} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
            <Statistic title="低库存商品" value={stats.lowStockProducts} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="库存正常商品" value={stats.totalProducts - stats.lowStockProducts} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="低库存占比" value={stats.totalProducts > 0 ? (stats.lowStockProducts / stats.totalProducts * 100).toFixed(1) : 0} suffix="%" valueStyle={{ color: stats.lowStockProducts / stats.totalProducts > 0.1 ? '#cf1322' : '#3f8600' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="库存概览">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="商品总数" value={stats.totalProducts} />
              </Col>
              <Col span={12}>
                <Statistic title="低库存预警" value={stats.lowStockProducts} valueStyle={{ color: '#faad14' }} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="库存预警分析">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="正常库存" value={stats.totalProducts - stats.lowStockProducts} valueStyle={{ color: '#3f8600' }} />
              </Col>
              <Col span={12}>
                <Statistic title="预警比例" value={stats.totalProducts > 0 ? (stats.lowStockProducts / stats.totalProducts * 100).toFixed(1) : 0} suffix="%" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="快速链接">
            <Space>
              <Card size="small" hoverable onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
                <Statistic title="本地库存" value={stats.totalProducts} />
              </Card>
              <Card size="small" hoverable onClick={() => navigate('/inventory/summary')} style={{ cursor: 'pointer' }}>
                <Statistic title="CD库存" value={platformStats?.inventoryStats?.cdTotal || 0} />
              </Card>
              <Card size="small" hoverable onClick={() => navigate('/inventory/cd')} style={{ cursor: 'pointer' }}>
                <Statistic title="EMAG库存" value={platformStats?.inventoryStats?.emagTotal || 0} />
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderPlatformDashboard = () => (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Card loading={platformLoading} hoverable onClick={() => navigate('/platform-orders')} style={{ cursor: 'pointer' }}>
            <Statistic title="平台订单总数" value={platformStats?.orderStats?.totalOrders || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={platformLoading} hoverable onClick={() => navigate('/platform-orders')} style={{ cursor: 'pointer' }}>
            <Statistic title="今日新增订单" value={platformStats?.orderStats?.todayOrders || 0} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={platformLoading}>
            <Statistic title="积加商品总数" value={platformStats?.productStats?.total || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={platformLoading}>
            <Statistic title="启用商品" value={platformStats?.productStats?.activeTotal || 0} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card loading={platformLoading} title="CD库存">
            <Statistic title="SKU数量" value={platformStats?.inventoryStats?.cdTotal || 0} />
            <Statistic title="可用库存" value={platformStats?.inventoryStats?.cdAvailable || 0} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={platformLoading} title="EMAG库存">
            <Statistic title="SKU数量" value={platformStats?.inventoryStats?.emagTotal || 0} />
            <Statistic title="可用库存" value={platformStats?.inventoryStats?.emagAvailable || 0} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={platformLoading} title="平台订单汇总">
            <Statistic title="订单总额" value={platformStats?.orderStats?.totalAmount || 0} precision={2} suffix="元" />
            <Statistic title="最后同步" value={platformStats?.orderStats?.lastSyncTime ? new Date(platformStats.orderStats.lastSyncTime).toLocaleString() : '从未同步'} valueStyle={{ fontSize: 14 }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="平台数据链接">
            <Space size="large">
              <Card size="small" hoverable onClick={() => navigate('/platform-orders')} style={{ cursor: 'pointer' }}>
                <Statistic title="查看平台订单" value=">>" />
              </Card>
              <Card size="small" hoverable onClick={() => navigate('/inventory/summary')} style={{ cursor: 'pointer' }}>
                <Statistic title="库存汇总" value=">>" />
              </Card>
              <Card size="small" hoverable onClick={() => navigate('/inventory/cd')} style={{ cursor: 'pointer' }}>
                <Statistic title="CD库存明细" value=">>" />
              </Card>
              <Card size="small" hoverable onClick={() => navigate('/inventory/emag')} style={{ cursor: 'pointer' }}>
                <Statistic title="EMAG库存明细" value=">>" />
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>数据看板</h1>
        <Select
          value={dashboardType}
          onChange={setDashboardType}
          style={{ width: 200 }}
          options={dashboardOptions.map(opt => ({
            ...opt,
            label: (
              <Space>
                {opt.icon}
                {opt.label}
              </Space>
            ),
          }))}
        />
      </div>
      {dashboardType === 'overview' && renderOverviewDashboard()}
      {dashboardType === 'sales' && renderSalesDashboard()}
      {dashboardType === 'purchase' && renderPurchaseDashboard()}
      {dashboardType === 'inventory' && renderInventoryDashboard()}
      {dashboardType === 'platform' && renderPlatformDashboard()}
    </div>
  );
};

export default DashboardPage;
