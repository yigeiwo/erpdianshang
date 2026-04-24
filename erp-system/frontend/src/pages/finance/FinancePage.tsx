import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Space, Tag, Empty, Modal, message } from 'antd';
import {
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AccountBookOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ReceivableRecord {
  id: string;
  date: string;
  customer: string;
  orderNo: string;
  amount: number;
  status: string;
}

interface PayableRecord {
  id: string;
  date: string;
  supplier: string;
  orderNo: string;
  amount: number;
  status: string;
}

const FinancePage: React.FC = () => {
  const [receivableVisible, setReceivableVisible] = useState(false);
  const [payableVisible, setPayableVisible] = useState(false);

  const [receivableData] = useState<ReceivableRecord[]>([
    { id: '1', date: '2024-04-20', customer: '客户A', orderNo: 'SO2024042001', amount: 50000, status: 'pending' },
    { id: '2', date: '2024-04-18', customer: '客户B', orderNo: 'SO2024041801', amount: 35000, status: 'completed' },
    { id: '3', date: '2024-04-15', customer: '客户C', orderNo: 'SO2024041501', amount: 28000, status: 'pending' },
  ]);

  const [payableData] = useState<PayableRecord[]>([
    { id: '1', date: '2024-04-19', supplier: '供应商X', orderNo: 'PO2024041901', amount: 45000, status: 'pending' },
    { id: '2', date: '2024-04-17', supplier: '供应商Y', orderNo: 'PO2024041701', amount: 32000, status: 'completed' },
    { id: '3', date: '2024-04-14', supplier: '供应商Z', orderNo: 'PO2024041401', amount: 28000, status: 'pending' },
  ]);

  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'orange', text: '待收款' },
    completed: { color: 'green', text: '已收款' },
    overdue: { color: 'red', text: '逾期' },
  };

  const receivableColumns: ColumnsType<ReceivableRecord> = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '客户', dataIndex: 'customer', key: 'customer' },
    { title: '单据号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '金额', dataIndex: 'amount', key: 'amount',
      render: (v) => `¥${v?.toFixed(2)}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => {
        const s = statusMap[v] || { color: 'default', text: v };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        record.status === 'pending' && (
          <Button type="link" size="small" onClick={() => handleReceive(record)}>收款</Button>
        )
      ),
    },
  ];

  const payableColumns: ColumnsType<PayableRecord> = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
    { title: '单据号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '金额', dataIndex: 'amount', key: 'amount',
      render: (v) => `¥${v?.toFixed(2)}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => {
        const s = statusMap[v] || { color: 'default', text: v };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        record.status === 'pending' && (
          <Button type="link" size="small" onClick={() => handlePay(record)}>付款</Button>
        )
      ),
    },
  ];

  const handleReceive = (record: ReceivableRecord) => {
    Modal.confirm({
      title: '确认收款',
      content: `确认收到客户 ${record.customer} 的款项 ¥${record.amount.toFixed(2)}？`,
      onOk: () => {
        message.success('收款成功');
      },
    });
  };

  const handlePay = (record: PayableRecord) => {
    Modal.confirm({
      title: '确认付款',
      content: `确认支付给供应商 ${record.supplier} 的款项 ¥${record.amount.toFixed(2)}？`,
      onOk: () => {
        message.success('付款成功');
      },
    });
  };

  const handleViewMore = (type: string) => {
    message.info(`${type}记录页面开发中`);
  };

  const totalReceivable = receivableData.reduce((sum, r) => sum + (r.status === 'pending' ? r.amount : 0), 0);
  const totalPayable = payableData.reduce((sum, r) => sum + (r.status === 'pending' ? r.amount : 0), 0);

  return (
    <div>
      <h2>财务管理</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="应收账款"
              value={totalReceivable}
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
              value={totalPayable}
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
          <Card
            title="收款记录"
            extra={
              <Space>
                <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setReceivableVisible(true)}>
                  添加收款
                </Button>
                <Button type="link" onClick={() => handleViewMore('收款')}>查看更多</Button>
              </Space>
            }
          >
            <Table
              dataSource={receivableData}
              columns={receivableColumns}
              pagination={false}
              size="small"
              locale={{ emptyText: <Empty description="暂无数据" /> }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="付款记录"
            extra={
              <Space>
                <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setPayableVisible(true)}>
                  添加付款
                </Button>
                <Button type="link" onClick={() => handleViewMore('付款')}>查看更多</Button>
              </Space>
            }
          >
            <Table
              dataSource={payableData}
              columns={payableColumns}
              pagination={false}
              size="small"
              locale={{ emptyText: <Empty description="暂无数据" /> }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="添加收款记录"
        open={receivableVisible}
        onCancel={() => setReceivableVisible(false)}
        footer={null}
      >
        <p>收款功能开发中...</p>
        <Button onClick={() => setReceivableVisible(false)}>关闭</Button>
      </Modal>

      <Modal
        title="添加付款记录"
        open={payableVisible}
        onCancel={() => setPayableVisible(false)}
        footer={null}
      >
        <p>付款功能开发中...</p>
        <Button onClick={() => setPayableVisible(false)}>关闭</Button>
      </Modal>
    </div>
  );
};

export default FinancePage;