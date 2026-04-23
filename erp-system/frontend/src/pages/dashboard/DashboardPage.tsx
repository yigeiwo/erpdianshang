import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const DashboardPage: React.FC = () => {
  const salesOption = {
    title: { text: '销售趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '销售额',
        type: 'line',
        data: [820, 932, 901, 934, 1290, 1330],
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
        data: [
          { value: 1048, name: '电子产品' },
          { value: 735, name: '服装' },
          { value: 580, name: '食品' },
          { value: 484, name: '家居' },
          { value: 300, name: '其他' },
        ],
      },
    ],
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>仪表盘</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日销售额"
              value={12893.5}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单数"
              value={156}
              prefix={<ShoppingOutlined />}
              suffix="笔"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="采购订单"
              value={42}
              prefix={<ShoppingCartOutlined />}
              suffix="笔"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月增长率"
              value={12.5}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
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
