import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from '../purchase/entities/purchase-order.entity';
import { PurchaseItem } from '../purchase/entities/purchase-item.entity';
import { SaleOrder } from '../sale/entities/sale-order.entity';
import { SaleItem } from '../sale/entities/sale-item.entity';
import { Product } from '../product/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrder,
      PurchaseItem,
      SaleOrder,
      SaleItem,
      Product,
      Inventory,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
