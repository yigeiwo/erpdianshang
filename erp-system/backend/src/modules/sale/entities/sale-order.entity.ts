import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';
import { SaleItem } from './sale-item.entity';

export enum SaleOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('sale_orders')
export class SaleOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_no', length: 50, unique: true })
  orderNo: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  finalAmount: number;

  @Column({ type: 'enum', enum: SaleOrderStatus, default: SaleOrderStatus.DRAFT })
  status: SaleOrderStatus;

  @Column({ name: 'order_date', type: 'date' })
  orderDate: Date;

  @OneToMany(() => SaleItem, (item) => item.saleOrder, { cascade: true })
  items: SaleItem[];

  @Column({ name: 'shipping_address', length: 200, nullable: true })
  shippingAddress: string;

  @Column({ name: 'receiver_name', length: 50, nullable: true })
  receiverName: string;

  @Column({ name: 'receiver_phone', length: 20, nullable: true })
  receiverPhone: string;

  @Column({ name: 'remark', type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
