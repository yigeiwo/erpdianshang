import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformInventoryService } from './platform-inventory.service';
import { QueryPlatformInventoryDto } from './dto/platform-inventory.dto';

@ApiTags('平台库存')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('platform-inventory')
export class PlatformInventoryController {
  constructor(private readonly platformInventoryService: PlatformInventoryService) {}

  @Get()
  @ApiOperation({ summary: '查询平台库存列表' })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'warehouse', required: false })
  @ApiQuery({ name: 'sku', required: false })
  @ApiQuery({ name: 'productName', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(@Query() query: QueryPlatformInventoryDto) {
    return this.platformInventoryService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取平台库存统计数据' })
  async getStatistics() {
    return this.platformInventoryService.getStatistics();
  }

  @Get('warehouse-summary')
  @ApiOperation({ summary: '获取仓库库存汇总' })
  async getWarehouseSummary() {
    return this.platformInventoryService.getWarehouseSummary();
  }

  @Post('sync')
  @ApiOperation({ summary: '从积加平台同步库存数据' })
  async sync() {
    return this.platformInventoryService.incrementSync();
  }
}