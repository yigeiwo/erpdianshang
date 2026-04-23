import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { InventoryLog } from '../inventory/entities/inventory-log.entity';
import { Product } from '../product/entities/product.entity';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { SupplierModule } from '../supplier/supplier.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, PurchaseItem, InventoryLog, Product]),
    SupplierModule,
    WarehouseModule,
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
