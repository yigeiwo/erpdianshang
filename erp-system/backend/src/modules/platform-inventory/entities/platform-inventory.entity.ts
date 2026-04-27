import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum InventorySource {
  CD = 'cd',
  EMAG = 'emag',
}

@Entity('platform_inventory')
export class PlatformInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_platform_sku')
  @Column({ name: 'platform', length: 20 })
  platform: string;

  @Index('idx_warehouse')
  @Column({ name: 'warehouse_id', length: 100 })
  warehouseId: string;

  @Column({ name: 'warehouse_name', length: 200 })
  warehouseName: string;

  @Index('idx_sku')
  @Column({ name: 'sku', length: 100 })
  sku: string;

  @Column({ name: 'spu', length: 100, nullable: true })
  spu: string;

  @Column({ name: 'product_id', length: 100, nullable: true })
  productId: string;

  @Column({ name: 'product_name', length: 500, nullable: true })
  productName: string;

  @Column({ name: 'product_image_url', length: 500, nullable: true })
  productImageUrl: string;

  @Column({ name: 'available', type: 'int', default: 0 })
  available: number;

  @Column({ name: 'allocated', type: 'int', default: 0 })
  allocated: number;

  @Column({ name: 'blocked', type: 'int', default: 0 })
  blocked: number;

  @Column({ name: 'reserved', type: 'int', default: 0 })
  reserved: number;

  @Column({ name: 'return_quantity', type: 'int', default: 0 })
  returnQuantity: number;

  @Column({ name: 'total', type: 'int', default: 0 })
  total: number;

  @Column({ name: 'unit', length: 20, nullable: true })
  unit: string;

  @Column({ name: 'status_name', length: 100, nullable: true })
  statusName: string;

  @Column({ name: 'brand_name', length: 100, nullable: true })
  brandName: string;

  @Column({ name: 'category_name', length: 100, nullable: true })
  categoryName: string;

  @Column({ name: 'product_type', length: 100, nullable: true })
  productType: string;

  @Column({ name: 'supply_mode_name', length: 100, nullable: true })
  supplyModeName: string;

  @Column({ name: 'avg_units_ordered_7_days', type: 'decimal', precision: 10, scale: 2, default: 0 })
  avgUnitsOrdered7Days: number;

  @Column({ name: 'avg_units_ordered_15_days', type: 'decimal', precision: 10, scale: 2, default: 0 })
  avgUnitsOrdered15Days: number;

  @Column({ name: 'avg_units_ordered_30_days', type: 'decimal', precision: 10, scale: 2, default: 0 })
  avgUnitsOrdered30Days: number;

  @Column({ name: 'single_quantity', type: 'int', default: 0 })
  singleQuantity: number;

  @Column({ name: 'product_delivery_days', type: 'int', default: 0 })
  productDeliveryDays: number;

  @Column({ name: 'product_manager_account_name', length: 100, nullable: true })
  productManagerAccountName: string;

  @Column({ name: 'update_time', type: 'timestamp', nullable: true })
  updateTime: Date;

  @Column({ name: 'raw_data', type: 'jsonb', nullable: true })
  rawData: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}