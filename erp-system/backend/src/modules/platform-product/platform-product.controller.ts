import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformProductService } from './platform-product.service';
import { QueryPlatformProductDto } from './dto/platform-product.dto';

@Controller('platform-products')
@UseGuards(JwtAuthGuard)
export class PlatformProductController {
  constructor(private readonly platformProductService: PlatformProductService) {}

  @Get()
  async findAll(@Query() query: QueryPlatformProductDto) {
    return this.platformProductService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return this.platformProductService.getStatistics();
  }

  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    return this.platformProductService.findBySku(sku);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.platformProductService.findOne(id);
  }

  @Post('sync')
  async sync() {
    return this.platformProductService.incrementSync();
  }
}