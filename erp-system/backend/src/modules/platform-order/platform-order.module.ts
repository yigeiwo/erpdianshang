import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformOrder } from './entities/platform-order.entity';
import { PlatformOrderService } from './platform-order.service';
import { PlatformOrderController } from './platform-order.controller';
import { OrderGateway } from './order.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformOrder])],
  controllers: [PlatformOrderController],
  providers: [PlatformOrderService, OrderGateway],
  exports: [PlatformOrderService, OrderGateway],
})
export class PlatformOrderModule {}