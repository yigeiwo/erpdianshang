import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleOrderDto, UpdateSaleOrderDto, QuerySaleOrderDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  create(@Body() dto: CreateSaleOrderDto, @CurrentUser('id') userId: string) {
    return this.saleService.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: QuerySaleOrderDto) {
    return this.saleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSaleOrderDto) {
    return this.saleService.update(id, dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.saleService.submit(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.saleService.approve(id, userId);
  }

  @Post(':id/ship')
  ship(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.saleService.ship(id, userId);
  }
}
