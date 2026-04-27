import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformInventory } from './entities/platform-inventory.entity';
import { PlatformInventoryService } from './platform-inventory.service';
import { PlatformInventoryController } from './platform-inventory.controller';
import { PlatformOrderModule } from '../platform-order/platform-order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlatformInventory]),
    forwardRef(() => PlatformOrderModule),
  ],
  controllers: [PlatformInventoryController],
  providers: [PlatformInventoryService],
  exports: [PlatformInventoryService],
})
export class PlatformInventoryModule {}