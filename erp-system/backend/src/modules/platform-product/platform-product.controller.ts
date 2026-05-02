import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformProductService } from './platform-product.service';
import { QueryPlatformProductDto } from './dto/platform-product.dto';

@ApiTags('平台产品')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('platform-products')
export class PlatformProductController {
  constructor(private readonly platformProductService: PlatformProductService) {}

  @Get()
  @ApiOperation({ summary: '查询平台产品列表' })
  @ApiQuery({ name: 'sku', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(@Query() query: QueryPlatformProductDto) {
    return this.platformProductService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取平台产品统计数据' })
  async getStatistics() {
    return this.platformProductService.getStatistics();
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: '根据 SKU 查询产品' })
  async findBySku(@Param('sku') sku: string) {
    return this.platformProductService.findBySku(sku);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 获取产品详情' })
  async findOne(@Param('id') id: string) {
    return this.platformProductService.findOne(id);
  }

  @Post('sync')
  @ApiOperation({ summary: '从积加平台同步产品数据' })
  async sync() {
    return this.platformProductService.incrementSync();
  }
}