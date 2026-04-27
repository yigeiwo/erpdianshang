import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformInventoryService } from './platform-inventory.service';
import { QueryPlatformInventoryDto } from './dto/platform-inventory.dto';

@Controller('platform-inventory')
@UseGuards(JwtAuthGuard)
export class PlatformInventoryController {
  constructor(private readonly platformInventoryService: PlatformInventoryService) {}

  @Get()
  async findAll(@Query() query: QueryPlatformInventoryDto) {
    return this.platformInventoryService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return this.platformInventoryService.getStatistics();
  }

  @Get('warehouse-summary')
  async getWarehouseSummary() {
    return this.platformInventoryService.getWarehouseSummary();
  }

  @Post('sync')
  async sync() {
    return this.platformInventoryService.incrementSync();
  }
}