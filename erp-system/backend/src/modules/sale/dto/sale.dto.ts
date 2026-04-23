import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { SaleOrderStatus } from '../entities/sale-order.entity';

class SaleItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  salePrice: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

export class CreateSaleOrderDto {
  @IsString()
  customerId: string;

  @IsString()
  warehouseId: string;

  @IsNumber()
  discountAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  receiverName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  receiverPhone?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateSaleOrderDto {
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsEnum(SaleOrderStatus)
  status?: SaleOrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  receiverName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  receiverPhone?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class QuerySaleOrderDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsEnum(SaleOrderStatus)
  status?: SaleOrderStatus;

  @IsOptional()
  @IsString()
  orderNo?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;
}
