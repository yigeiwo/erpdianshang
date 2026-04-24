import React from 'react';
import { Row, Col, Card, Statistic, Table, Button, message } from 'antd';
import {
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AccountBookOutlined,
} from '@ant-design/icons';

const FinancePage: React.FC = () => {
  const handleViewMore = (type: string) => {
    message.info(`${type}记录开发中`);
  };

  return (
    <div>
      <h2>财务管理</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="应收账款"
              value={128893.5}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="应付账款"
              value={89342.8}
              precision={2}
              prefix={<AccountBookOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={256780}
              precision={2}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月支出"
              value={189340}
              precision={2}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="收款记录" extra={<Button type="link" onClick={() => handleViewMore('收款')}>查看更多</Button>}>
            <Table
              dataSource={[]}
              columns={[
                { title: '日期', dataIndex: 'date', key: 'date' },
                { title: '客户', dataIndex: 'customer', key: 'customer' },
                { title: '金额', dataIndex: 'amount', key: 'amount',
                  render: (v) => `¥${v?.toFixed(2) || '0.00'}` },
                { title: '状态', dataIndex: 'status', key: 'status' },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="付款记录" extra={<Button type="link" onClick={() => handleViewMore('付款')}>查看更多</Button>}>
            <Table
              dataSource={[]}
              columns={[
                { title: '日期', dataIndex: 'date', key: 'date' },
                { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
                { title: '金额', dataIndex: 'amount', key: 'amount',
                  render: (v) => `¥${v?.toFixed(2) || '0.00'}` },
                { title: '状态', dataIndex: 'status', key: 'status' },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancePage;