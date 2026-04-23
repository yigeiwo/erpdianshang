import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderStatus } from '../entities/purchase-order.entity';

class PurchaseItemDto {
  @IsString()
  productId: string;

  @IsString()
  warehouseId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  costPrice: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  supplierId: string;

  @IsString()
  warehouseId: string;

  @IsNumber()
  discountAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class QueryPurchaseOrderDto {
  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @IsOptional()
  @IsString()
  orderNo?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;
}

export class ApprovePurchaseOrderDto {
  @IsOptional()
  @IsString()
  remark?: string;
}
