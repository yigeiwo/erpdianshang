import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { PlatformOrder } from './entities/platform-order.entity';
import { QueryPlatformOrderDto, SyncPlatformOrderDto } from './dto/platform-order.dto';
import { OrderGateway } from './order.gateway';
import { JiJiaApiService } from '../common/ji-jia-api.service';
import { buildLikePattern } from '../../common/utils';

interface JiJiaOrderItem {
  platformOrderLineId?: string;
  sku?: string;
  msku?: string;
  productId?: string;
  skuName?: string;
  productName?: string;
  productUnitPrice?: string | number;
  productTotalPrice?: string | number;
  buyQuantity?: string | number;
  shippedQuantity?: string | number;
  trackingNumber?: string;
  platformWarehouseName?: string;
  platformOrderLineStatus?: string;
  platformOrderLineStatusName?: string;
  linePerformingParty?: number;
  orderPerformingParty?: number;
  giftStatus?: string;
  productMainImageUrl?: string;
  listingUrl?: string;
}

interface JiJiaOrderRecord {
  id?: string;
  platformOrderId?: string;
  orderingTime?: string;
  paymentTime?: string;
  platformId?: string;
  erpShopId?: string;
  erpShopName?: string;
  regionCnName?: string;
  orderType?: string;
  orderCategory?: string;
  platformOrderStatus?: string;
  platformOrderStatusName?: string;
  orderDeliveryStatus?: number;
  orderCancelStatus?: number;
  orderRefundStatus?: number;
  totalAmount?: string | number;
  buyerPayAmount?: string | number;
  discountFee?: string | number;
  platformCommission?: string | number;
  refundedTotalAmount?: string | number;
  currency?: string;
  buyerAccountId?: string;
  buyerAccountName?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverMobilePhone?: string;
  receiverAddressCountry?: string;
  receiverAddressState?: string;
  receiverAddressCity?: string;
  receiverAddressDetail1?: string;
  receiverAddressDetail2?: string;
  receiverAddressPostCode?: string;
  buyerMessage?: string;
  customerMemo?: string;
  items?: JiJiaOrderItem[];
}

interface JiJiaOrderResponse {
  records: JiJiaOrderRecord[];
  total: number;
}

interface OrderStatistics {
  totalOrders: number;
  todayOrders: number;
  totalAmount: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

export { JiJiaOrderItem, JiJiaOrderRecord, JiJiaOrderResponse, OrderStatistics };

@Injectable()
export class PlatformOrderService implements OnModuleInit {
  private readonly logger = new Logger(PlatformOrderService.name);
  private lastSyncTime: Date | null = null;
  private isSyncing = false;
  private lastSyncKey: string | null = null;
  private newOrdersBuffer: Partial<PlatformOrder>[] = [];
  private bufferFlushInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(PlatformOrder)
    private readonly platformOrderRepository: Repository<PlatformOrder>,
    private readonly jiJiaApiService: JiJiaApiService,
    @Inject(forwardRef(() => OrderGateway))
    private readonly orderGateway: OrderGateway,
  ) {
    this.startBufferFlush();
  }

  private startBufferFlush() {
    this.bufferFlushInterval = setInterval(() => {
      if (this.newOrdersBuffer.length > 0) {
        const orders = [...this.newOrdersBuffer];
        this.newOrdersBuffer = [];
        this.orderGateway.emitNewOrders(orders);
      }
    }, 5000);
  }

  onModuleInit() {
    this.logger.log('平台订单同步服务已启动，每 3 分钟自动同步');
  }

  private async fetchOrdersFromJiJia(
    page: number,
    pageSize: number,
    startTime?: string,
    endTime?: string,
  ): Promise<JiJiaOrderResponse | null> {
    const requestData: Record<string, any> = {
      page,
      pagesize: pageSize,
    };

    if (startTime && endTime) {
      requestData.orderingTimeQueryBegin = startTime;
      requestData.orderingTimeQueryEnd = endTime;
    }

    const response = await this.jiJiaApiService.request<JiJiaOrderResponse>(
      '/platform/multiplatform/commonOrder/page',
      'POST',
      requestData,
    );
    return response?.data || null;
  }

  private transformOrderData(order: JiJiaOrderRecord): Partial<PlatformOrder> {
    return {
      platformOrderId: order.id || order.platformOrderId || '',
      orderingTime: order.orderingTime ? new Date(order.orderingTime) : null,
      paymentTime: order.paymentTime ? new Date(order.paymentTime) : null,
      platformId: order.platformId || '',
      platformName: order.platformId || '积加',
      erpShopId: order.erpShopId || '',
      erpShopName: order.erpShopName || '',
      regionCnName: order.regionCnName || '',
      orderType: order.orderType || '',
      orderCategory: order.orderCategory || '',
      orderStatus: order.platformOrderStatus || '',
      orderStatusName: order.platformOrderStatusName || '',
      deliveryStatus: order.orderDeliveryStatus,
      cancelStatus: order.orderCancelStatus,
      refundStatus: order.orderRefundStatus,
      totalAmount: Number(order.totalAmount) || 0,
      buyerPayAmount: Number(order.buyerPayAmount) || 0,
      discountFee: Number(order.discountFee) || 0,
      platformCommission: Number(order.platformCommission) || 0,
      refundedAmount: Number(order.refundedTotalAmount) || 0,
      currency: order.currency || 'USD',
      buyerAccountId: order.buyerAccountId || '',
      buyerAccountName: order.buyerAccountName || '',
      receiverName: order.receiverName || '',
      receiverPhone: order.receiverPhone || '',
      receiverMobilePhone: order.receiverMobilePhone || '',
      receiverCountry: order.receiverAddressCountry || '',
      receiverState: order.receiverAddressState || '',
      receiverCity: order.receiverAddressCity || '',
      receiverAddressDetail1: order.receiverAddressDetail1 || '',
      receiverAddressDetail2: order.receiverAddressDetail2 || '',
      receiverPostCode: order.receiverAddressPostCode || '',
      buyerMessage: order.buyerMessage || '',
      sellerMemo: order.customerMemo || '',
      rawData: order as unknown as Record<string, unknown>,
    };
  }

  private transformOrderItem(
    baseData: Partial<PlatformOrder>,
    item: JiJiaOrderItem,
  ): Partial<PlatformOrder> {
    return {
      ...baseData,
      platformOrderLineId: item.platformOrderLineId || '',
      sku: item.sku || '',
      msku: item.msku || '',
      productId: item.productId || '',
      skuName: item.skuName || '',
      productName: item.productName || '',
      productUnitPrice: Number(item.productUnitPrice) || 0,
      productTotalPrice: Number(item.productTotalPrice) || 0,
      buyQuantity: Number(item.buyQuantity) || 0,
      shippedQuantity: Number(item.shippedQuantity) || 0,
      trackingNumber: item.trackingNumber || '',
      platformWarehouseName: item.platformWarehouseName || '',
      lineStatus: item.platformOrderLineStatus || '',
      lineStatusName: item.platformOrderLineStatusName || '',
      performingParty: item.linePerformingParty || item.orderPerformingParty,
      giftStatus: item.giftStatus || '',
      productImageUrl: item.productMainImageUrl || '',
      listingUrl: item.listingUrl || '',
    };
  }

  private generateSyncKey(startTime: string, endTime: string): string {
    return `${startTime}_${endTime}`;
  }

  @Cron('*/3 * * * *')
  async handleCron() {
    await this.incrementSync();
  }

  async incrementSync(): Promise<{ synced: number; error?: string }> {
    if (this.isSyncing) {
      this.logger.log('同步任务正在进行中，跳过本次执行');
      return { synced: 0 };
    }

    this.isSyncing = true;

    try {
      const now = new Date();
      const syncKey = this.generateSyncKey(
        now.toISOString().slice(0, 19),
        now.toISOString().slice(0, 19),
      );

      if (this.lastSyncKey === syncKey && this.lastSyncTime) {
        const diff = now.getTime() - this.lastSyncTime.getTime();
        if (diff < 180000) {
          this.logger.log('距离上次同步不足 3 分钟，跳过');
          return { synced: 0 };
        }
      }

      const endTime = now.toISOString().slice(0, 19).replace('T', ' ');
      const startTime = new Date(now.getTime() - 15 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      this.logger.log(`开始增量同步积加订单: ${startTime} 至 ${endTime}`);

      let page = 1;
      const pageSize = 200;
      let totalSynced = 0;
      let hasMore = true;
      let lastOrderTime: Date | null = null;

      while (hasMore) {
        const response = await this.fetchOrdersFromJiJia(page, pageSize, startTime, endTime);

        if (!response || !response.records) {
          this.logger.error(`第 ${page} 页获取失败`);
          break;
        }

        const { records } = response;

        if (!records || records.length === 0) {
          this.logger.log('没有更多订单数据');
          break;
        }

        const newOrders: Partial<PlatformOrder>[] = [];

        for (const order of records) {
          const baseData = this.transformOrderData(order);
          const items = order.items || [];

          if (items.length === 0) {
            const saved = await this.upsertOrder(baseData);
            totalSynced++;
            if (saved) newOrders.push(saved);
          } else {
            for (const item of items) {
              const itemData = this.transformOrderItem(baseData, item);
              const saved = await this.upsertOrder(itemData);
              totalSynced++;
              if (saved) newOrders.push(saved);
            }
          }

          if (order.orderingTime) {
            const orderTime = new Date(order.orderingTime);
            if (!lastOrderTime || orderTime > lastOrderTime) {
              lastOrderTime = orderTime;
            }
          }
        }

        if (newOrders.length > 0) {
          this.newOrdersBuffer.push(...newOrders);
        }

        this.logger.log(
          `第 ${page} 页完成，本页 ${records.length} 条，累计 ${totalSynced} 条`,
        );

        if (records.length < pageSize) {
          hasMore = false;
        }

        page++;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      this.lastSyncTime = now;
      this.lastSyncKey = syncKey;
      this.logger.log(`增量同步完成，总共同步 ${totalSynced} 条订单明细`);

      if (totalSynced > 0) {
        this.orderGateway.emitSyncComplete(totalSynced);
      }

      return { synced: totalSynced };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`增量同步失败: ${err.message}`);
      return { synced: 0, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  private async upsertOrder(data: Partial<PlatformOrder>): Promise<Partial<PlatformOrder> | null> {
    if (!data.platformOrderId) return null;

    const existing = await this.platformOrderRepository.findOne({
      where: {
        platformOrderId: data.platformOrderId,
        platformOrderLineId: data.platformOrderLineId || '',
      },
    });

    const query = this.platformOrderRepository
      .createQueryBuilder()
      .insert()
      .into(PlatformOrder)
      .values(data)
      .orUpdate(
        [
          'ordering_time', 'payment_time', 'order_status', 'order_status_name',
          'delivery_status', 'cancel_status', 'refund_status', 'total_amount',
          'buyer_pay_amount', 'discount_fee', 'platform_commission', 'refunded_amount',
          'buyer_account_name', 'receiver_name', 'receiver_phone', 'receiver_mobile_phone',
          'receiver_country', 'receiver_state', 'receiver_city',
          'receiver_address_detail1', 'receiver_address_detail2', 'receiver_post_code',
          'tracking_number', 'line_status', 'line_status_name', 'product_unit_price',
          'product_total_price', 'buy_quantity', 'shipped_quantity', 'seller_memo',
          'raw_data', 'updated_at',
        ],
        ['platform_order_id', 'platform_order_line_id'],
      );

    await query.execute();

    return existing ? null : data;
  }

  async syncFromJiJia(dto: SyncPlatformOrderDto): Promise<{ synced: number; error?: string }> {
    const { startDate, endDate, backtrackDays } = dto;

    let startTime: string;
    let endTime: string;

    if (startDate && endDate) {
      startTime = startDate;
      endTime = endDate;
    } else {
      const days = backtrackDays || 7;
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      endTime = end.toISOString().slice(0, 19).replace('T', ' ');
      startTime = start.toISOString().slice(0, 19).replace('T', ' ');
    }

    this.logger.log(`手动同步积加订单: ${startTime} 至 ${endTime}`);

    let page = 1;
    const pageSize = 200;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetchOrdersFromJiJia(page, pageSize, startTime, endTime);

      if (!response || !response.records) {
        this.logger.error(`第 ${page} 页获取失败`);
        break;
      }

      const { records } = response;

      if (!records || records.length === 0) {
        this.logger.log('没有更多订单数据');
        break;
      }

        let newCount = 0;
        for (const order of records) {
          const baseData = this.transformOrderData(order);
          const items = order.items || [];

          if (items.length === 0) {
            const saved = await this.upsertOrder(baseData);
            totalSynced++;
            if (saved) newCount++;
          } else {
            for (const item of items) {
              const itemData = this.transformOrderItem(baseData, item);
              const saved = await this.upsertOrder(itemData);
              totalSynced++;
              if (saved) newCount++;
            }
          }
        }

        if (newCount > 0) {
          this.orderGateway.emitSyncComplete(newCount);
        }

      this.logger.log(
        `第 ${page} 页完成，本页 ${records.length} 条，累计 ${totalSynced} 条`,
      );

      if (records.length < pageSize) {
        hasMore = false;
      }

      page++;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    this.logger.log(`同步完成，总共同步 ${totalSynced} 条订单明细`);
    return { synced: totalSynced };
  }

  async findAll(query: QueryPlatformOrderDto): Promise<{ list: PlatformOrder[]; total: number }> {
    const { platformId, shopId, orderStatus, sku, startDate, endDate, page = 1, pageSize = 50 } = query;

    const queryBuilder = this.platformOrderRepository.createQueryBuilder('p');

    if (platformId) queryBuilder.andWhere('p.platformId = :platformId', { platformId });
    if (shopId) queryBuilder.andWhere('p.erpShopId = :shopId', { shopId });
    if (orderStatus) queryBuilder.andWhere('p.orderStatus = :orderStatus', { orderStatus });
    if (sku) queryBuilder.andWhere('p.sku LIKE :sku', { sku: buildLikePattern(sku) });

    if (startDate && endDate) {
      queryBuilder.andWhere('p.orderingTime BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    queryBuilder.andWhere('p.platformOrderLineId IS NOT NULL AND p.platformOrderLineId != \'\'');
    queryBuilder.orderBy('p.orderingTime', 'DESC');
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return { list, total };
  }

  async findOne(id: string): Promise<PlatformOrder> {
    return this.platformOrderRepository.findOne({ where: { id } });
  }

  async getStatistics(): Promise<OrderStatistics> {
    const totalOrders = await this.platformOrderRepository
      .createQueryBuilder('p')
      .where('p.platformOrderLineId IS NOT NULL AND p.platformOrderLineId != \'\'')
      .getCount();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await this.platformOrderRepository
      .createQueryBuilder('p')
      .where('p.orderingTime >= :today', { today })
      .andWhere('p.platformOrderLineId IS NOT NULL AND p.platformOrderLineId != \'\'')
      .getCount();

    const totalAmount = await this.platformOrderRepository
      .createQueryBuilder('p')
      .select('SUM(p.totalAmount)', 'total')
      .where('p.platformOrderLineId IS NOT NULL AND p.platformOrderLineId != \'\'')
      .getRawOne();

    return {
      totalOrders,
      todayOrders,
      totalAmount: parseFloat(totalAmount?.total) || 0,
      lastSyncTime: this.lastSyncTime?.toISOString() || null,
      isSyncing: this.isSyncing,
    };
  }
}