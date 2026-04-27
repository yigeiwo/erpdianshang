import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('platform_products')
export class PlatformProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_jijia_product_id')
  @Column({ name: 'jijia_product_id', length: 100, unique: true })
  jijiaProductId: string;

  @Index('idx_jijia_sku')
  @Column({ name: 'sku', length: 200 })
  sku: string;

  @Column({ name: 'name', length: 1000 })
  name: string;

  @Column({ name: 'brief_name', length: 1000, nullable: true })
  briefName: string;

  @Column({ name: 'category', length: 100, nullable: true })
  category: string;

  @Column({ name: 'category_name', length: 200, nullable: true })
  categoryName: string;

  @Column({ name: 'brand', length: 100, nullable: true })
  brand: string;

  @Column({ name: 'brand_name', length: 200, nullable: true })
  brandName: string;

  @Column({ name: 'product_type_name', length: 200, nullable: true })
  productTypeName: string;

  @Column({ name: 'unit', length: 50, nullable: true })
  unit: string;

  @Column({ type: 'int', default: 0 })
  state: number;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ name: 'level_name', length: 200, nullable: true })
  levelName: string;

  @Column({ type: 'int', default: 0 })
  purchase: number;

  @Column({ name: 'purchase_account', length: 200, nullable: true })
  purchaseAccount: string;

  @Column({ name: 'product_manager_account', length: 200, nullable: true })
  productManagerAccount: string;

  @Column({ name: 'product_manager_account_id', length: 100, nullable: true })
  productManagerAccountId: string;

  @Column({ name: 'product_delivery_days', type: 'int', default: 0 })
  productDeliveryDays: number;

  @Column({ type: 'text', nullable: true })
  assembly: string;

  @Column({ name: 'assembly_labor_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  assemblyLaborCost: number;

  @Column({ name: 'assembly_package', type: 'text', nullable: true })
  assemblyPackage: string;

  @Column({ name: 'chinese_customs_name', length: 1000, nullable: true })
  chineseCustomsName: string;

  @Column({ name: 'english_customs_name', length: 1000, nullable: true })
  englishCustomsName: string;

  @Column({ name: 'customs_code', length: 100, nullable: true })
  customsCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  material: string;

  @Column({ name: 'currency_code', length: 10, nullable: true })
  currencyCode: string;

  @Column({ name: 'currency_symbol', length: 10, nullable: true })
  currencySymbol: string;

  @Column({ name: 'small_image_url', length: 1000, nullable: true })
  smallImageUrl: string;

  @Column({ name: 'package_l', type: 'decimal', precision: 10, scale: 2, default: 0 })
  packageL: number;

  @Column({ name: 'package_w', type: 'decimal', precision: 10, scale: 2, default: 0 })
  packageW: number;

  @Column({ name: 'package_h', type: 'decimal', precision: 10, scale: 2, default: 0 })
  packageH: number;

  @Column({ name: 'package_weight', type: 'decimal', precision: 10, scale: 2, default: 0 })
  packageWeight: number;

  @Column({ name: 'single_product_size_l', type: 'decimal', precision: 10, scale: 2, default: 0 })
  singleProductSizeL: number;

  @Column({ name: 'single_product_size_w', type: 'decimal', precision: 10, scale: 2, default: 0 })
  singleProductSizeW: number;

  @Column({ name: 'single_product_size_h', type: 'decimal', precision: 10, scale: 2, default: 0 })
  singleProductSizeH: number;

  @Column({ name: 'battery_attribute', length: 100, nullable: true })
  batteryAttribute: string;

  @Column({ name: 'liquid_attribute', length: 100, nullable: true })
  liquidAttribute: string;

  @Column({ name: 'magnetic_attribute', length: 100, nullable: true })
  magneticAttribute: string;

  @Column({ name: 'powder_attribute', length: 100, nullable: true })
  powderAttribute: string;

  @Column({ name: 'charged_attribute', length: 100, nullable: true })
  chargedAttribute: string;

  @Column({ name: 'wooden_attribute', length: 100, nullable: true })
  woodenAttribute: string;

  @Column({ type: 'int', default: 0 })
  clothing: number;

  @Column({ name: 'is_inspection', type: 'int', default: 0 })
  isInspection: number;

  @Column({ name: 'add_date', type: 'timestamp', nullable: true })
  addDate: Date;

  @Column({ name: 'last_date', type: 'timestamp', nullable: true })
  lastDate: Date;

  @Column({ name: 'raw_data', type: 'jsonb', nullable: true })
  rawData: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}