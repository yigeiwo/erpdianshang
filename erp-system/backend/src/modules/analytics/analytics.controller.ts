import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('sales-trend')
  getSalesTrend(@Query('days') days?: string) {
    return this.analyticsService.getSalesTrend(days ? parseInt(days) : 30);
  }

  @Get('sales-by-category')
  getSalesByCategory() {
    return this.analyticsService.getSalesByCategory();
  }

  @Get('inventory-stats')
  getInventoryStats() {
    return this.analyticsService.getInventoryStats();
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string, @Query('type') type?: 'sales' | 'purchases') {
    return this.analyticsService.getTopProducts(
      limit ? parseInt(limit) : 10,
      type || 'sales',
    );
  }

  @Get('profit-analysis')
  getProfitAnalysis() {
    return this.analyticsService.getProfitAnalysis();
  }
}
