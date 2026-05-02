import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { QueryInventoryDto, AdjustInventoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('库存管理')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: '查询库存列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('logs')
  @ApiOperation({ summary: '查询库存变动日志' })
  @ApiQuery({ name: 'productId', required: false, description: '商品 ID' })
  @ApiQuery({ name: 'warehouseId', required: false, description: '仓库 ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  getLogs(@Query('productId') productId?: string, @Query('warehouseId') warehouseId?: string) {
    return this.inventoryService.getLogs(productId, warehouseId);
  }

  @Post('adjust')
  @ApiOperation({ summary: '调整库存' })
  @ApiResponse({ status: 201, description: '调整成功' })
  adjust(@Body() dto: AdjustInventoryDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.adjust(dto, userId);
  }
}
