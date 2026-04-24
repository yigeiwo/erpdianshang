import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { analyticsService } from '../../services';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
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
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>仪表盘</h1>
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
    </div>
  );
};

export default DashboardPage;
