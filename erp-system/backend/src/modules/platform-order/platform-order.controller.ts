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
import { PlatformOrderService } from './platform-order.service';
import { QueryPlatformOrderDto, SyncPlatformOrderDto } from './dto/platform-order.dto';

@ApiTags('平台订单')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('platform-orders')
export class PlatformOrderController {
  constructor(private readonly platformOrderService: PlatformOrderService) {}

  @Get()
  @ApiOperation({ summary: '查询平台订单列表' })
  @ApiQuery({ name: 'platformId', required: false })
  @ApiQuery({ name: 'shopId', required: false })
  @ApiQuery({ name: 'orderStatus', required: false })
  @ApiQuery({ name: 'sku', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(@Query() query: QueryPlatformOrderDto) {
    return this.platformOrderService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取平台订单统计数据' })
  async getStatistics() {
    return this.platformOrderService.getStatistics();
  }

  @Post('sync')
  @ApiOperation({ summary: '从积加平台同步订单数据' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'backtrackDays', required: false, type: Number })
  async syncFromJiJia(@Query() query: SyncPlatformOrderDto) {
    return this.platformOrderService.syncFromJiJia(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 获取订单详情' })
  async findOne(@Param('id') id: string) {
    return this.platformOrderService.findOne(id);
  }
}