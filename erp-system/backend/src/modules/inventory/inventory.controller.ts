import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { QueryInventoryDto, AdjustInventoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('logs')
  getLogs(@Query('productId') productId?: string, @Query('warehouseId') warehouseId?: string) {
    return this.inventoryService.getLogs(productId, warehouseId);
  }

  @Post('adjust')
  adjust(@Body() dto: AdjustInventoryDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.adjust(dto, userId);
  }
}
