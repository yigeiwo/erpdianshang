import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto, ApprovePurchaseOrderDto } from './dto/purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('采购管理')
@ApiBearerAuth()
@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: '创建采购单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser('id') userId: string) {
    return this.purchaseService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: '查询采购单列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryPurchaseOrderDto) {
    return this.purchaseService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 查询采购单' })
  @ApiParam({ name: 'id', description: '采购单 ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新采购单' })
  @ApiParam({ name: 'id', description: '采购单 ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseService.update(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交采购单' })
  @ApiParam({ name: 'id', description: '采购单 ID' })
  @ApiResponse({ status: 200, description: '提交成功' })
  submit(@Param('id') id: string) {
    return this.purchaseService.submit(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批采购单' })
  @ApiParam({ name: 'id', description: '采购单 ID' })
  @ApiResponse({ status: 200, description: '审批成功' })
  approve(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: ApprovePurchaseOrderDto) {
    return this.purchaseService.approve(id, userId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成采购入库' })
  @ApiParam({ name: 'id', description: '采购单 ID' })
  @ApiResponse({ status: 200, description: '入库成功' })
  completeIn(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseService.completeIn(id, userId);
  }
}
