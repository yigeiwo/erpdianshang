import { IsOptional, IsString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPlatformInventoryDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  warehouse?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  pageSize?: number = 50;
}