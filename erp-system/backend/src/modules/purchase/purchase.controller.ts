import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto, ApprovePurchaseOrderDto } from './dto/purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser('id') userId: string) {
    return this.purchaseService.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: QueryPurchaseOrderDto) {
    return this.purchaseService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseService.update(id, dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.purchaseService.submit(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: ApprovePurchaseOrderDto) {
    return this.purchaseService.approve(id, userId);
  }

  @Post(':id/complete')
  completeIn(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseService.completeIn(id, userId);
  }
}
