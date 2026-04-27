import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformOrderService } from './platform-order.service';
import { QueryPlatformOrderDto, SyncPlatformOrderDto } from './dto/platform-order.dto';

@Controller('platform-orders')
@UseGuards(JwtAuthGuard)
export class PlatformOrderController {
  constructor(private readonly platformOrderService: PlatformOrderService) {}

  @Get()
  async findAll(@Query() query: QueryPlatformOrderDto) {
    return this.platformOrderService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return this.platformOrderService.getStatistics();
  }

  @Post('sync')
  async syncFromJiJia(@Query() query: SyncPlatformOrderDto) {
    return this.platformOrderService.syncFromJiJia(query);
  }

  @Get(':id')
  async findOne(@Query('id') id: string) {
    return this.platformOrderService.findOne(id);
  }
}