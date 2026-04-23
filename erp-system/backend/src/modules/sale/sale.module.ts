import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleOrder } from './entities/sale-order.entity';
import { SaleItem } from './entities/sale-item.entity';
import { InventoryLog } from '../inventory/entities/inventory-log.entity';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { CustomerModule } from '../customer/customer.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleOrder, SaleItem, InventoryLog]),
    CustomerModule,
    WarehouseModule,
  ],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}
