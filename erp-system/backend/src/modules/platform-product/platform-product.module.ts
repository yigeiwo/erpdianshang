import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformProduct } from './entities/platform-product.entity';
import { PlatformProductService } from './platform-product.service';
import { PlatformProductController } from './platform-product.controller';
import { PlatformOrderModule } from '../platform-order/platform-order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlatformProduct]),
    forwardRef(() => PlatformOrderModule),
  ],
  controllers: [PlatformProductController],
  providers: [PlatformProductService],
  exports: [PlatformProductService],
})
export class PlatformProductModule {}