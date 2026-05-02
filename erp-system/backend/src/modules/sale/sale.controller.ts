import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SaleService } from './sale.service';
import { CreateSaleOrderDto, UpdateSaleOrderDto, QuerySaleOrderDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('销售管理')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @ApiOperation({ summary: '创建销售单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() dto: CreateSaleOrderDto, @CurrentUser('id') userId: string) {
    return this.saleService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: '查询销售单列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QuerySaleOrderDto) {
    return this.saleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 查询销售单' })
  @ApiParam({ name: 'id', description: '销售单 ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新销售单' })
  @ApiParam({ name: 'id', description: '销售单 ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateSaleOrderDto) {
    return this.saleService.update(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交销售单' })
  @ApiParam({ name: 'id', description: '销售单 ID' })
  @ApiResponse({ status: 200, description: '提交成功' })
  submit(@Param('id') id: string) {
    return this.saleService.submit(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批销售单' })
  @ApiParam({ name: 'id', description: '销售单 ID' })
  @ApiResponse({ status: 200, description: '审批成功' })
  approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.saleService.approve(id, userId);
  }

  @Post(':id/ship')
  @ApiOperation({ summary: '发货' })
  @ApiParam({ name: 'id', description: '销售单 ID' })
  @ApiResponse({ status: 200, description: '发货成功' })
  ship(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.saleService.ship(id, userId);
  }
}
