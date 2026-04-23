import React, { useState } from 'react';
import { Table, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Inventory {
  id: string;
  product: { name: string; productCode: string };
  warehouse: { name: string };
  quantity: number;
  availableQuantity: number;
  lockedQuantity: number;
}

const InventoryList: React.FC = () => {
  const [data] = useState<Inventory[]>([]);
  const [loading] = useState(false);

  const columns: ColumnsType<Inventory> = [
    { title: '商品编码', dataIndex: ['product', 'productCode'], key: 'productCode' },
    { title: '商品名称', dataIndex: ['product', 'name'], key: 'productName' },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    { title: '总数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '可用数量', dataIndex: 'availableQuantity', key: 'availableQuantity' },
    { title: '锁定数量', dataIndex: 'lockedQuantity', key: 'lockedQuantity' },
  ];

  return (
    <div>
      <h2>库存管理</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">库存盘点</Button>
        <Button>库存预警设置</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default InventoryList;
