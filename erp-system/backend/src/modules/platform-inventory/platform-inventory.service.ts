import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { PlatformInventory } from './entities/platform-inventory.entity';
import { QueryPlatformInventoryDto } from './dto/platform-inventory.dto';
import { OrderGateway } from '../platform-order/order.gateway';
import { JiJiaApiService } from '../common/ji-jia-api.service';
import { buildLikePattern } from '../../common/utils';

interface InventoryApiResponse {
  records: any[];
  total: number;
}

@Injectable()
export class PlatformInventoryService implements OnModuleInit {
  private readonly logger = new Logger(PlatformInventoryService.name);
  private lastSyncTime: Date | null = null;
  private isSyncing = false;

  constructor(
    @InjectRepository(PlatformInventory)
    private readonly inventoryRepository: Repository<PlatformInventory>,
    private readonly jiJiaApiService: JiJiaApiService,
    @Inject(forwardRef(() => OrderGateway))
    private readonly orderGateway: OrderGateway,
  ) {}

  onModuleInit() {
    this.logger.log('平台库存同步服务已启动，每 5 分钟自动同步');
  }

  private async fetchInventoryFromApi(
    endpoint: string,
    page: number,
    pageSize: number,
  ): Promise<{ records: any[] } | null> {
    const response = await this.jiJiaApiService.request<InventoryApiResponse>(endpoint, 'POST', {
      page,
      pagesize: pageSize,
    });
    return response?.data || null;
  }

  private transformInventoryData(record: any, platform: string): Partial<PlatformInventory> {
    return {
      platform,
      warehouseId: record.warehouseId || '',
      warehouseName: record.warehouseName || '',
      sku: record.sku || '',
      spu: record.spu || '',
      productId: record.productId || '',
      productName: record.productName || '',
      productImageUrl: record.productImageUrl || '',
      available: parseInt(record.available) || 0,
      allocated: parseInt(record.allocated) || 0,
      blocked: parseInt(record.blocked) || 0,
      reserved: parseInt(record.reserved) || 0,
      returnQuantity: parseInt(record.returnQuantity) || 0,
      total: parseInt(record.total) || 0,
      unit: record.unit || '',
      statusName: record.statusName || '',
      brandName: record.brandName || '',
      categoryName: record.categoryName || '',
      productType: record.productType || '',
      supplyModeName: record.supplyModeName || '',
      avgUnitsOrdered7Days: parseFloat(record.avgUnitsOrdered7Days) || 0,
      avgUnitsOrdered15Days: parseFloat(record.avgUnitsOrdered15Days) || 0,
      avgUnitsOrdered30Days: parseFloat(record.avgUnitsOrdered30Days) || 0,
      singleQuantity: parseInt(record.singleQuantity) || 0,
      productDeliveryDays: parseInt(record.productDeliveryDays) || 0,
      productManagerAccountName: record.productManagerAccountName || '',
      updateTime: record.updateTime ? new Date(record.updateTime) : null,
      rawData: record,
    };
  }

  private async upsertInventory(data: Partial<PlatformInventory>): Promise<void> {
    const existing = await this.inventoryRepository.findOne({
      where: {
        platform: data.platform,
        sku: data.sku,
        warehouseId: data.warehouseId,
      },
    });

    if (existing) {
      await this.inventoryRepository.update(existing.id, {
        ...data,
        updatedAt: new Date(),
      });
    } else {
      await this.inventoryRepository.save(data);
    }
  }

  @Cron('*/5 * * * *')
  async handleCron() {
    await this.incrementSync();
  }

  async incrementSync(): Promise<{ synced: number; error?: string }> {
    if (this.isSyncing) {
      this.logger.log('库存同步任务正在进行中，跳过本次执行');
      return { synced: 0 };
    }

    this.isSyncing = true;
    let totalSynced = 0;

    try {
      this.logger.log('开始增量同步平台库存...');

      totalSynced += await this.syncCdInventory();
      totalSynced += await this.syncEmagInventory();

      this.lastSyncTime = new Date();
      this.logger.log(`库存同步完成，总共同步 ${totalSynced} 条`);

      if (totalSynced > 0) {
        this.orderGateway.emitInventoryUpdate({
          type: 'inventory-sync',
          total: totalSynced,
          timestamp: new Date().toISOString(),
        });
      }

      return { synced: totalSynced };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`库存同步失败: ${err.message}`);
      return { synced: totalSynced, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncCdInventory(): Promise<number> {
    const endpoint = '/gipx/inv/cdiscountFbcInventory/pageQuery';
    let page = 1;
    const pageSize = 500;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetchInventoryFromApi(endpoint, page, pageSize);

      if (!response || !response.records) {
        break;
      }

      const { records } = response;

      if (!records || records.length === 0) {
        break;
      }

      for (const record of records) {
        const data = this.transformInventoryData(record, 'cd');
        await this.upsertInventory(data);
        totalSynced++;
      }

      this.logger.log(`CD 库存第 ${page} 页完成，本页 ${records.length} 条`);

      if (records.length < pageSize) {
        hasMore = false;
      }

      page++;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    return totalSynced;
  }

  private async syncEmagInventory(): Promise<number> {
    const endpoint = '/gipx/inv/emagFbeInventory/pageQuery';
    let page = 1;
    const pageSize = 500;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetchInventoryFromApi(endpoint, page, pageSize);

      if (!response || !response.records) {
        break;
      }

      const { records } = response;

      if (!records || records.length === 0) {
        break;
      }

      for (const record of records) {
        const warehouseName = record.warehouseName || '';
        if (warehouseName.includes('BG:BG_FBE') || warehouseName.includes('HU:HU_FBE')) {
          continue;
        }

        const data = this.transformInventoryData(record, 'emag');
        await this.upsertInventory(data);
        totalSynced++;
      }

      this.logger.log(`EMAG 库存第 ${page} 页完成，本页 ${records.length} 条`);

      if (records.length < pageSize) {
        hasMore = false;
      }

      page++;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    return totalSynced;
  }

  async findAll(query: QueryPlatformInventoryDto): Promise<{ list: PlatformInventory[]; total: number }> {
    const { platform, warehouse, sku, productName, page = 1, pageSize = 50 } = query;

    const queryBuilder = this.inventoryRepository.createQueryBuilder('i');

    if (platform) queryBuilder.andWhere('i.platform = :platform', { platform });
    if (warehouse) queryBuilder.andWhere('i.warehouseName LIKE :warehouse', { warehouse: buildLikePattern(warehouse) });
    if (sku) queryBuilder.andWhere('i.sku LIKE :sku', { sku: buildLikePattern(sku) });
    if (productName) queryBuilder.andWhere('i.productName LIKE :productName', { productName: buildLikePattern(productName) });

    queryBuilder.orderBy('i.updateTime', 'DESC');
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return { list, total };
  }

  async getStatistics(): Promise<any> {
    const cdTotal = await this.inventoryRepository
      .createQueryBuilder('i')
      .where('i.platform = :platform', { platform: 'cd' })
      .getCount();

    const emagTotal = await this.inventoryRepository
      .createQueryBuilder('i')
      .where('i.platform = :platform', { platform: 'emag' })
      .getCount();

    const cdAvailableResult = await this.inventoryRepository
      .createQueryBuilder('i')
      .select('SUM(i.available)', 'total')
      .where('i.platform = :platform', { platform: 'cd' })
      .getRawOne();

    const emagAvailableResult = await this.inventoryRepository
      .createQueryBuilder('i')
      .select('SUM(i.available)', 'total')
      .where('i.platform = :platform', { platform: 'emag' })
      .getRawOne();

    return {
      cdTotal,
      emagTotal,
      cdAvailable: parseInt(cdAvailableResult?.total) || 0,
      emagAvailable: parseInt(emagAvailableResult?.total) || 0,
      lastSyncTime: this.lastSyncTime?.toISOString() || null,
      isSyncing: this.isSyncing,
    };
  }

  async getWarehouseSummary(): Promise<any[]> {
    const result = await this.inventoryRepository
      .createQueryBuilder('i')
      .select('i.platform', 'platform')
      .addSelect('i.warehouseName', 'warehouseName')
      .addSelect('COUNT(*)', 'skuCount')
      .addSelect('SUM(i.available)', 'available')
      .addSelect('SUM(i.total)', 'total')
      .groupBy('i.platform')
      .addGroupBy('i.warehouseName')
      .orderBy('i.platform', 'ASC')
      .addOrderBy('i.warehouseName', 'ASC')
      .getRawMany();

    return result;
  }
}