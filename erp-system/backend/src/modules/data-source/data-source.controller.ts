import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DataSourceService, CreatePlatformDto, UpdatePlatformDto, CreateSpiderConfigDto } from './data-source.service';
import { SpiderConfig } from './entities/spider-config.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('data-source')
@UseGuards(JwtAuthGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post('platforms')
  createPlatform(@Body() dto: CreatePlatformDto) {
    return this.dataSourceService.createPlatform(dto);
  }

  @Get('platforms')
  findAllPlatforms() {
    return this.dataSourceService.findAllPlatforms();
  }

  @Get('platforms/:id')
  findPlatform(@Param('id') id: string) {
    return this.dataSourceService.findPlatform(id);
  }

  @Put('platforms/:id')
  updatePlatform(@Param('id') id: string, @Body() dto: UpdatePlatformDto) {
    return this.dataSourceService.updatePlatform(id, dto);
  }

  @Post('platforms/:id/sync')
  syncPlatform(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.dataSourceService.syncPlatformData(id, userId);
  }

  @Post('spider-configs')
  createSpiderConfig(@Body() dto: CreateSpiderConfigDto) {
    return this.dataSourceService.createSpiderConfig(dto);
  }

  @Get('spider-configs')
  findAllSpiderConfigs() {
    return this.dataSourceService.findAllSpiderConfigs();
  }

  @Get('spider-configs/:id')
  findSpiderConfig(@Param('id') id: string) {
    return this.dataSourceService.findSpiderConfig(id);
  }

  @Put('spider-configs/:id')
  updateSpiderConfig(@Param('id') id: string, @Body() dto: Partial<SpiderConfig>) {
    return this.dataSourceService.updateSpiderConfig(id, dto);
  }

  @Get('sync-logs')
  findSyncLogs(@Query('platformId') platformId?: string) {
    return this.dataSourceService.findSyncLogs(platformId);
  }
}
