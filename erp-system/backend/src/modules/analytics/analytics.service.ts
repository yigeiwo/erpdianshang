import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from '../purchase/entities/purchase-order.entity';
import { SaleOrder, SaleOrderStatus } from '../sale/entities/sale-order.entity';
import { Product } from '../product/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseRepository: Repository<PurchaseOrder>,
    @InjectRepository(SaleOrder)
    private readonly saleRepository: Repository<SaleOrder>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalProducts,
      lowStockProducts,
      pendingPurchases,
      completedPurchases,
      pendingSales,
      completedSales,
    ] = await Promise.all([
      this.productRepository.count({ where: { isActive: true } }),
      this.productRepository.count({ where: { isActive: true } }).then(() =>
        this.productRepository.createQueryBuilder('p')
          .where('p.stock < p.minStock')
          .getCount()
      ),
      this.purchaseRepository.count({ where: { status: PurchaseOrderStatus.PENDING } }),
      this.purchaseRepository.count({ where: { status: PurchaseOrderStatus.COMPLETED } }),
      this.saleRepository.count({ where: { status: SaleOrderStatus.PENDING } }),
      this.saleRepository.count({ where: { status: SaleOrderStatus.COMPLETED } }),
    ]);

    const monthlyPurchases = await this.purchaseRepository
      .createQueryBuilder('p')
      .select('SUM(p.final_amount)', 'total')
      .where('p.status = :status', { status: PurchaseOrderStatus.COMPLETED })
      .andWhere('p.created_at >= :startOfMonth', { startOfMonth })
      .getRawOne();

    const monthlySales = await this.saleRepository
      .createQueryBuilder('s')
      .select('SUM(s.final_amount)', 'total')
      .where('s.status = :status', { status: SaleOrderStatus.COMPLETED })
      .andWhere('s.created_at >= :startOfMonth', { startOfMonth })
      .getRawOne();

    const yearlyPurchases = await this.purchaseRepository
      .createQueryBuilder('p')
      .select('SUM(p.final_amount)', 'total')
      .where('p.status = :status', { status: PurchaseOrderStatus.COMPLETED })
      .andWhere('p.created_at >= :startOfYear', { startOfYear })
      .getRawOne();

    const yearlySales = await this.saleRepository
      .createQueryBuilder('s')
      .select('SUM(s.final_amount)', 'total')
      .where('s.status = :status', { status: SaleOrderStatus.COMPLETED })
      .andWhere('s.created_at >= :startOfYear', { startOfYear })
      .getRawOne();

    return {
      totalProducts,
      lowStockProducts,
      pendingPurchases,
      completedPurchases,
      pendingSales,
      completedSales,
      monthlyPurchases: parseFloat(monthlyPurchases?.total || '0'),
      monthlySales: parseFloat(monthlySales?.total || '0'),
      yearlyPurchases: parseFloat(yearlyPurchases?.total || '0'),
      yearlySales: parseFloat(yearlySales?.total || '0'),
    };
  }

  async getSalesTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await this.saleRepository
      .createQueryBuilder('s')
      .select('DATE(s.order_date)', 'date')
      .addSelect('SUM(s.final_amount)', 'amount')
      .addSelect('COUNT(*)', 'count')
      .where('s.status IN (:...statuses)', {
        statuses: [SaleOrderStatus.COMPLETED, SaleOrderStatus.IN_PROGRESS],
      })
      .andWhere('s.order_date >= :startDate', { startDate })
      .groupBy('DATE(s.order_date)')
      .orderBy('DATE(s.order_date)', 'ASC')
      .getRawMany();

    return sales;
  }

  async getSalesByCategory() {
    const result = await this.saleRepository
      .createQueryBuilder('s')
      .leftJoin('s.items', 'item')
      .leftJoin('item.product', 'p')
      .leftJoin('p.category', 'c')
      .select('COALESCE(c.name, \'未分类\')', 'category')
      .addSelect('SUM(s.final_amount)', 'amount')
      .addSelect('COUNT(DISTINCT s.id)', 'orderCount')
      .where('s.status IN (:...statuses)', {
        statuses: [SaleOrderStatus.COMPLETED, SaleOrderStatus.IN_PROGRESS],
      })
      .groupBy('c.name')
      .orderBy('amount', 'DESC')
      .getRawMany();

    return result;
  }

  async getInventoryStats() {
    const [totalProducts, totalValue, lowStock, outOfStock] = await Promise.all([
      this.inventoryRepository.createQueryBuilder('i')
        .select('COUNT(DISTINCT i.productId)')
        .getRawOne(),
      this.inventoryRepository
        .createQueryBuilder('i')
        .leftJoin('i.product', 'p')
        .select('SUM(i.quantity * p.costPrice)', 'value')
        .getRawOne(),
      this.productRepository.createQueryBuilder('p')
        .where('p.stock < p.minStock AND p.stock > 0')
        .getCount(),
      this.productRepository.createQueryBuilder('p')
        .where('p.stock <= 0')
        .getCount(),
    ]);

    return {
      totalProducts: parseInt(totalProducts?.count || '0'),
      totalValue: parseFloat(totalValue?.value || '0'),
      lowStock,
      outOfStock,
    };
  }

  async getTopProducts(limit: number = 10, type: 'sales' | 'purchases' = 'sales') {
    if (type === 'sales') {
      const result = await this.saleRepository
        .createQueryBuilder('s')
        .leftJoin('s.items', 'item')
        .leftJoin('item.product', 'p')
        .select('p.id', 'productId')
        .addSelect('p.name', 'productName')
        .addSelect('p.productCode', 'productCode')
        .addSelect('SUM(item.quantity)', 'totalQuantity')
        .addSelect('SUM(item.subtotal)', 'totalAmount')
        .where('s.status IN (:...statuses)', {
          statuses: [SaleOrderStatus.COMPLETED, SaleOrderStatus.IN_PROGRESS],
        })
        .groupBy('p.id')
        .addGroupBy('p.name')
        .addGroupBy('p.productCode')
        .orderBy('totalAmount', 'DESC')
        .limit(limit)
        .getRawMany();

      return result;
    } else {
      const result = await this.purchaseRepository
        .createQueryBuilder('p')
        .leftJoin('p.items', 'item')
        .leftJoin('item.product', 'pr')
        .select('pr.id', 'productId')
        .addSelect('pr.name', 'productName')
        .addSelect('pr.productCode', 'productCode')
        .addSelect('SUM(item.quantity)', 'totalQuantity')
        .addSelect('SUM(item.subtotal)', 'totalAmount')
        .where('p.status IN (:...statuses)', {
          statuses: [PurchaseOrderStatus.COMPLETED, PurchaseOrderStatus.APPROVED],
        })
        .groupBy('pr.id')
        .addGroupBy('pr.name')
        .addGroupBy('pr.productCode')
        .orderBy('totalAmount', 'DESC')
        .limit(limit)
        .getRawMany();

      return result;
    }
  }

  async getProfitAnalysis() {
    const completedSales = await this.saleRepository
      .createQueryBuilder('s')
      .select('SUM(s.final_amount)', 'revenue')
      .where('s.status = :status', { status: SaleOrderStatus.COMPLETED })
      .getRawOne();

    const completedPurchases = await this.purchaseRepository
      .createQueryBuilder('p')
      .select('SUM(p.final_amount)', 'cost')
      .where('p.status = :status', { status: PurchaseOrderStatus.COMPLETED })
      .getRawOne();

    const revenue = parseFloat(completedSales?.revenue || '0');
    const cost = parseFloat(completedPurchases?.cost || '0');
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      cost,
      profit,
      margin: parseFloat(margin.toFixed(2)),
    };
  }
}
