import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { PlatformProduct } from './entities/platform-product.entity';
import { QueryPlatformProductDto } from './dto/platform-product.dto';
import { OrderGateway } from '../platform-order/order.gateway';
import { JiJiaApiService } from '../common/ji-jia-api.service';
import { buildLikePattern } from '../../common/utils';

interface ProductRecord {
  id?: string | number;
  sku?: string;
  name?: string;
  briefName?: string;
  category?: string;
  categoryName?: string;
  brand?: string;
  brandName?: string;
  productTypeName?: string;
  unit?: string;
  state?: string | number;
  level?: string | number;
  levelName?: string;
  purchase?: string | number;
  purchaseAccount?: string;
  productManagerAccount?: string;
  productManagerAccountId?: string;
  productDeliveryDays?: string | number;
  assembly?: string;
  assemblyLaborCost?: string | number;
  assemblyPackage?: string;
  chineseCustomsName?: string;
  englishCustomsName?: string;
  customsCode?: string;
  description?: string;
  material?: string;
  currencyCode?: string;
  currencySymbol?: string;
  smallImageUrl?: string;
  packageL?: string | number;
  packageW?: string | number;
  packageH?: string | number;
  packageWeight?: string | number;
  singleProductSizeL?: string | number;
  singleProductSizeW?: string | number;
  singleProductSizeH?: string | number;
  batteryAttribute?: boolean | string;
  liquidAttribute?: boolean | string;
  magneticAttribute?: boolean | string;
  powderAttribute?: boolean | string;
  chargedAttribute?: boolean | string;
  woodenAttribute?: boolean | string;
  clothing?: string | number;
  isInspection?: string | number;
  addDate?: string;
  lastDate?: string;
}

interface ProductApiResponse {
  rows: ProductRecord[];
  total: number;
}

interface ProductStatistics {
  total: number;
  activeTotal: number;
  categoryTop10: { category: string; count: string }[];
  lastSyncTime: string | null;
  isSyncing: boolean;
}

export { ProductRecord, ProductApiResponse, ProductStatistics };

@Injectable()
export class PlatformProductService implements OnModuleInit {
  private readonly logger = new Logger(PlatformProductService.name);
  private lastSyncTime: Date | null = null;
  private isSyncing = false;

  constructor(
    @InjectRepository(PlatformProduct)
    private readonly productRepository: Repository<PlatformProduct>,
    private readonly jiJiaApiService: JiJiaApiService,
    @Inject(forwardRef(() => OrderGateway))
    private readonly orderGateway: OrderGateway,
  ) {}

  onModuleInit() {
    this.logger.log('积加商品详情同步服务已启动，每 10 分钟自动同步');
  }

  private async fetchProductsFromApi(
    pageNo: number,
    pageSize: number,
  ): Promise<ProductApiResponse | null> {
    const response = await this.jiJiaApiService.request<ProductApiResponse>(
      '/purchase/goods/product/page',
      'POST',
      {
        page: pageNo,
        pagesize: pageSize,
        status: 1,
      },
    );
    return response?.data || null;
  }

  private transformProductData(product: ProductRecord): Partial<PlatformProduct> {
    return {
      jijiaProductId: String(product.id) || '',
      sku: product.sku || '',
      name: product.name || '',
      briefName: product.briefName || '',
      category: product.category || '',
      categoryName: product.categoryName || '',
      brand: product.brand || '',
      brandName: product.brandName || '',
      productTypeName: product.productTypeName || '',
      unit: product.unit || '',
      state: Number(product.state) || 0,
      level: Number(product.level) || 0,
      levelName: product.levelName || '',
      purchase: Number(product.purchase) || 0,
      purchaseAccount: product.purchaseAccount || '',
      productManagerAccount: product.productManagerAccount || '',
      productManagerAccountId: product.productManagerAccountId || '',
      productDeliveryDays: Number(product.productDeliveryDays) || 0,
      assembly: product.assembly || '',
      assemblyLaborCost: Number(product.assemblyLaborCost) || 0,
      assemblyPackage: product.assemblyPackage || '',
      chineseCustomsName: product.chineseCustomsName || '',
      englishCustomsName: product.englishCustomsName || '',
      customsCode: product.customsCode || '',
      description: product.description || '',
      material: product.material || '',
      currencyCode: product.currencyCode || '',
      currencySymbol: product.currencySymbol || '',
      smallImageUrl: product.smallImageUrl || '',
      packageL: Number(product.packageL) || 0,
      packageW: Number(product.packageW) || 0,
      packageH: Number(product.packageH) || 0,
      packageWeight: Number(product.packageWeight) || 0,
      singleProductSizeL: Number(product.singleProductSizeL) || 0,
      singleProductSizeW: Number(product.singleProductSizeW) || 0,
      singleProductSizeH: Number(product.singleProductSizeH) || 0,
      batteryAttribute: String(product.batteryAttribute),
      liquidAttribute: String(product.liquidAttribute),
      magneticAttribute: String(product.magneticAttribute),
      powderAttribute: String(product.powderAttribute),
      chargedAttribute: String(product.chargedAttribute),
      woodenAttribute: String(product.woodenAttribute),
      clothing: Number(product.clothing) || 0,
      isInspection: Number(product.isInspection) || 0,
      addDate: product.addDate ? new Date(product.addDate) : null,
      lastDate: product.lastDate ? new Date(product.lastDate) : null,
      rawData: product as unknown as Record<string, unknown>,
    };
  }

  private async upsertProduct(data: Partial<PlatformProduct>): Promise<boolean> {
    if (!data.jijiaProductId) return false;

    const existing = await this.productRepository.findOne({
      where: { jijiaProductId: data.jijiaProductId },
    });

    if (existing) {
      await this.productRepository.update(existing.id, {
        ...data,
        updatedAt: new Date(),
      });
      return false;
    } else {
      await this.productRepository.save(data);
      return true;
    }
  }

  @Cron('*/10 * * * *')
  async handleCron() {
    await this.incrementSync();
  }

  async incrementSync(): Promise<{ synced: number; added: number; error?: string }> {
    if (this.isSyncing) {
      this.logger.log('商品同步任务正在进行中，跳过本次执行');
      return { synced: 0, added: 0 };
    }

    this.isSyncing = true;
    let totalSynced = 0;
    let totalAdded = 0;

    try {
      this.logger.log('开始同步积加商品详情...');

      let pageNo = 1;
      const pageSize = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await this.fetchProductsFromApi(pageNo, pageSize);

        if (!response || !response.rows) {
          break;
        }

        const { rows } = response;

        if (!rows || rows.length === 0) {
          break;
        }

        for (const product of rows) {
          const data = this.transformProductData(product);
          const isNew = await this.upsertProduct(data);
          totalSynced++;
          if (isNew) totalAdded++;
        }

        this.logger.log(`商品详情第 ${pageNo} 页完成，本页 ${rows.length} 条`);

        if (rows.length < pageSize) {
          hasMore = false;
        }

        pageNo++;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      this.lastSyncTime = new Date();
      this.logger.log(`商品详情同步完成，总共 ${totalSynced} 条，新增 ${totalAdded} 条`);

      if (totalSynced > 0) {
        this.orderGateway.emitProductUpdate({
          type: 'product-sync',
          total: totalSynced,
          added: totalAdded,
          timestamp: new Date().toISOString(),
        });
      }

      return { synced: totalSynced, added: totalAdded };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`商品详情同步失败: ${err.message}`);
      return { synced: totalSynced, added: totalAdded, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async findAll(query: QueryPlatformProductDto): Promise<{ list: PlatformProduct[]; total: number }> {
    const { sku, name, category, brand, page = 1, pageSize = 50 } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('p');

    if (sku) queryBuilder.andWhere('p.sku LIKE :sku', { sku: buildLikePattern(sku) });
    if (name) queryBuilder.andWhere('p.name LIKE :name', { name: buildLikePattern(name) });
    if (category) queryBuilder.andWhere('p.categoryName LIKE :category', { category: buildLikePattern(category) });
    if (brand) queryBuilder.andWhere('p.brandName LIKE :brand', { brand: buildLikePattern(brand) });

    queryBuilder.orderBy('p.lastDate', 'DESC');
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return { list, total };
  }

  async findOne(id: string): Promise<PlatformProduct> {
    return this.productRepository.findOne({ where: { id } });
  }

  async findBySku(sku: string): Promise<PlatformProduct[]> {
    return this.productRepository.find({
      where: { sku: sku },
      order: { lastDate: 'DESC' },
    });
  }

  async getStatistics(): Promise<ProductStatistics> {
    const total = await this.productRepository.count();
    const activeTotal = await this.productRepository
      .createQueryBuilder('p')
      .where('p.state = :state', { state: 1 })
      .getCount();

    const categoryResult = await this.productRepository
      .createQueryBuilder('p')
      .select('p.categoryName', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.categoryName')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      activeTotal,
      categoryTop10: categoryResult,
      lastSyncTime: this.lastSyncTime?.toISOString() || null,
      isSyncing: this.isSyncing,
    };
  }
}