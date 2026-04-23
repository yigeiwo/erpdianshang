import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { SupplierModule } from '../supplier/supplier.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), SupplierModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
