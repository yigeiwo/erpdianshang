import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

export enum InventoryLogType {
  PURCHASE_IN = 'purchase_in',
  PURCHASE_RETURN = 'purchase_return',
  SALE_OUT = 'sale_out',
  SALE_RETURN = 'sale_return',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  ADJUST_IN = 'adjust_in',
  ADJUST_OUT = 'adjust_out',
}

@Entity('inventory_logs')
export class InventoryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'log_type', type: 'enum', enum: InventoryLogType })
  logType: InventoryLogType;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'before_quantity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  beforeQuantity: number;

  @Column({ name: 'after_quantity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  afterQuantity: number;

  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  @Column({ name: 'order_type', nullable: true })
  orderType: string;

  @Column({ name: 'remark', type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
