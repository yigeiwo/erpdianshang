import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { InventoryLogType } from '../entities/inventory-log.entity';

export class QueryInventoryDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;
}

export class CreateInventoryLogDto {
  @IsString()
  productId: string;

  @IsString()
  warehouseId: string;

  @IsEnum(InventoryLogType)
  logType: InventoryLogType;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class AdjustInventoryDto {
  @IsString()
  productId: string;

  @IsString()
  warehouseId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  remark: string;
}
