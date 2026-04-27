import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('platform_orders')
@Unique(['platformOrderId', 'platformOrderLineId'])
export class PlatformOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_platform_order_id')
  @Column({ name: 'platform_order_id', length: 100 })
  platformOrderId: string;

  @Index('idx_platform_order_line_id')
  @Column({ name: 'platform_order_line_id', length: 100, nullable: true })
  platformOrderLineId: string;

  @Index('idx_ordering_time')
  @Column({ name: 'ordering_time', type: 'timestamp', nullable: true })
  orderingTime: Date;

  @Index('idx_payment_time')
  @Column({ name: 'payment_time', type: 'timestamp', nullable: true })
  paymentTime: Date;

  @Column({ name: 'platform_id', length: 50, nullable: true })
  platformId: string;

  @Column({ name: 'platform_name', length: 100, nullable: true })
  platformName: string;

  @Column({ name: 'erp_shop_id', length: 100, nullable: true })
  erpShopId: string;

  @Column({ name: 'erp_shop_name', length: 200, nullable: true })
  erpShopName: string;

  @Column({ name: 'region_cn_name', length: 100, nullable: true })
  regionCnName: string;

  @Column({ name: 'order_type', length: 50, nullable: true })
  orderType: string;

  @Column({ name: 'order_category', length: 50, nullable: true })
  orderCategory: string;

  @Column({ name: 'order_status', length: 50, nullable: true })
  orderStatus: string;

  @Column({ name: 'order_status_name', length: 100, nullable: true })
  orderStatusName: string;

  @Column({ name: 'delivery_status', type: 'int', nullable: true })
  deliveryStatus: number;

  @Column({ name: 'cancel_status', type: 'int', nullable: true })
  cancelStatus: number;

  @Column({ name: 'refund_status', type: 'int', nullable: true })
  refundStatus: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ name: 'buyer_pay_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  buyerPayAmount: number;

  @Column({ name: 'discount_fee', type: 'decimal', precision: 15, scale: 2, nullable: true })
  discountFee: number;

  @Column({ name: 'platform_commission', type: 'decimal', precision: 15, scale: 2, nullable: true })
  platformCommission: number;

  @Column({ name: 'refunded_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  refundedAmount: number;

  @Column({ name: 'currency', length: 10, nullable: true })
  currency: string;

  @Column({ name: 'buyer_account_id', length: 100, nullable: true })
  buyerAccountId: string;

  @Column({ name: 'buyer_account_name', length: 100, nullable: true })
  buyerAccountName: string;

  @Column({ name: 'receiver_name', length: 100, nullable: true })
  receiverName: string;

  @Column({ name: 'receiver_phone', length: 50, nullable: true })
  receiverPhone: string;

  @Column({ name: 'receiver_mobile_phone', length: 50, nullable: true })
  receiverMobilePhone: string;

  @Column({ name: 'receiver_country', length: 100, nullable: true })
  receiverCountry: string;

  @Column({ name: 'receiver_state', length: 100, nullable: true })
  receiverState: string;

  @Column({ name: 'receiver_city', length: 100, nullable: true })
  receiverCity: string;

  @Column({ name: 'receiver_address_detail1', length: 500, nullable: true })
  receiverAddressDetail1: string;

  @Column({ name: 'receiver_address_detail2', length: 500, nullable: true })
  receiverAddressDetail2: string;

  @Column({ name: 'receiver_post_code', length: 20, nullable: true })
  receiverPostCode: string;

  @Column({ name: 'sku', length: 100, nullable: true })
  sku: string;

  @Column({ name: 'msku', length: 100, nullable: true })
  msku: string;

  @Column({ name: 'product_id', length: 100, nullable: true })
  productId: string;

  @Column({ name: 'sku_name', length: 500, nullable: true })
  skuName: string;

  @Column({ name: 'product_name', length: 1000, nullable: true })
  productName: string;

  @Column({ name: 'product_unit_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  productUnitPrice: number;

  @Column({ name: 'product_total_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  productTotalPrice: number;

  @Column({ name: 'buy_quantity', type: 'int', nullable: true })
  buyQuantity: number;

  @Column({ name: 'shipped_quantity', type: 'int', nullable: true })
  shippedQuantity: number;

  @Column({ name: 'tracking_number', length: 100, nullable: true })
  trackingNumber: string;

  @Column({ name: 'platform_warehouse_name', length: 200, nullable: true })
  platformWarehouseName: string;

  @Column({ name: 'line_status', length: 50, nullable: true })
  lineStatus: string;

  @Column({ name: 'line_status_name', length: 100, nullable: true })
  lineStatusName: string;

  @Column({ name: 'performing_party', type: 'int', nullable: true })
  performingParty: number;

  @Column({ name: 'gift_status', length: 50, nullable: true })
  giftStatus: string;

  @Column({ name: 'product_image_url', length: 500, nullable: true })
  productImageUrl: string;

  @Column({ name: 'listing_url', length: 500, nullable: true })
  listingUrl: string;

  @Column({ name: 'buyer_message', type: 'text', nullable: true })
  buyerMessage: string;

  @Column({ name: 'seller_memo', type: 'text', nullable: true })
  sellerMemo: string;

  @Column({ name: 'raw_data', type: 'jsonb', nullable: true })
  rawData: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}