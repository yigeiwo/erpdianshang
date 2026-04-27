import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPlatformOrderDto {
  @IsOptional()
  @IsString()
  platformId?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  orderStatus?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  pageSize?: number = 50;
}

export class SyncPlatformOrderDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  backtrackDays?: number = 7;
}