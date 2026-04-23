import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataPlatform, PlatformType } from './entities/data-platform.entity';
import { DataSyncLog, SyncStatus, SyncType } from './entities/data-sync-log.entity';
import { SpiderConfig } from './entities/spider-config.entity';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export class CreatePlatformDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  platform: PlatformType;

  @IsOptional()
  @IsString()
  apiUrl?: string;

  @IsOptional()
  @IsString()
  appKey?: string;

  @IsOptional()
  @IsString()
  appSecret?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePlatformDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  apiUrl?: string;

  @IsOptional()
  @IsString()
  appKey?: string;

  @IsOptional()
  @IsString()
  appSecret?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSpiderConfigDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  platform: string;

  @IsString()
  startUrl: string;

  @IsOptional()
  @IsString()
  allowedDomains?: string[];

  @IsOptional()
  rules?: Record<string, any>;

  @IsOptional()
  headers?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  proxyEnabled?: boolean;

  @IsOptional()
  @IsString()
  proxyUrl?: string;

  @IsOptional()
  delaySeconds?: number;

  @IsOptional()
  maxRetries?: number;
}

@Injectable()
export class DataSourceService {
  constructor(
    @InjectRepository(DataPlatform)
    private readonly platformRepository: Repository<DataPlatform>,
    @InjectRepository(DataSyncLog)
    private readonly syncLogRepository: Repository<DataSyncLog>,
    @InjectRepository(SpiderConfig)
    private readonly spiderConfigRepository: Repository<SpiderConfig>,
  ) {}

  async createPlatform(dto: CreatePlatformDto): Promise<DataPlatform> {
    const platform = this.platformRepository.create(dto);
    return this.platformRepository.save(platform);
  }

  async findAllPlatforms(): Promise<DataPlatform[]> {
    return this.platformRepository.find();
  }

  async findPlatform(id: string): Promise<DataPlatform> {
    const platform = await this.platformRepository.findOne({ where: { id } });
    if (!platform) throw new NotFoundException(`Platform ${id} not found`);
    return platform;
  }

  async updatePlatform(id: string, dto: UpdatePlatformDto): Promise<DataPlatform> {
    const platform = await this.findPlatform(id);
    Object.assign(platform, dto);
    return this.platformRepository.save(platform);
  }

  async createSpiderConfig(dto: CreateSpiderConfigDto): Promise<SpiderConfig> {
    const config = this.spiderConfigRepository.create(dto);
    return this.spiderConfigRepository.save(config);
  }

  async findAllSpiderConfigs(): Promise<SpiderConfig[]> {
    return this.spiderConfigRepository.find();
  }

  async findSpiderConfig(id: string): Promise<SpiderConfig> {
    const config = await this.spiderConfigRepository.findOne({ where: { id } });
    if (!config) throw new NotFoundException(`Spider config ${id} not found`);
    return config;
  }

  async updateSpiderConfig(id: string, dto: Partial<SpiderConfig>): Promise<SpiderConfig> {
    const config = await this.findSpiderConfig(id);
    Object.assign(config, dto);
    return this.spiderConfigRepository.save(config);
  }

  async createSyncLog(platformId: string, syncType: SyncType): Promise<DataSyncLog> {
    const log = this.syncLogRepository.create({
      platformId,
      syncType,
      status: SyncStatus.PENDING,
      startTime: new Date(),
    });
    return this.syncLogRepository.save(log);
  }

  async updateSyncLog(id: string, updates: Partial<DataSyncLog>): Promise<DataSyncLog> {
    await this.syncLogRepository.update(id, updates);
    return this.findSyncLog(id);
  }

  async findSyncLog(id: string): Promise<DataSyncLog> {
    return this.syncLogRepository.findOne({ where: { id } });
  }

  async findSyncLogs(platformId?: string): Promise<DataSyncLog[]> {
    const queryBuilder = this.syncLogRepository.createQueryBuilder('log');
    if (platformId) {
      queryBuilder.where('log.platformId = :platformId', { platformId });
    }
    return queryBuilder.orderBy('log.createdAt', 'DESC').take(50).getMany();
  }

  async syncPlatformData(platformId: string, userId: string) {
    const platform = await this.findPlatform(platformId);
    const syncLog = await this.createSyncLog(platformId, SyncType.MANUAL);

    try {
      await this.updateSyncLog(syncLog.id, { status: SyncStatus.RUNNING });

      await this.platformRepository.update(platformId, {
        syncStatus: 'running',
        lastSyncAt: new Date(),
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.updateSyncLog(syncLog.id, {
        status: SyncStatus.SUCCESS,
        endTime: new Date(),
        itemsSynced: Math.floor(Math.random() * 100),
        itemsFailed: 0,
      });

      await this.platformRepository.update(platformId, { syncStatus: 'idle' });

      return { success: true, logId: syncLog.id };
    } catch (error: any) {
      await this.updateSyncLog(syncLog.id, {
        status: SyncStatus.FAILED,
        endTime: new Date(),
        error: error?.message || String(error),
      });
      await this.platformRepository.update(platformId, { syncStatus: 'error' });
      throw error;
    }
  }
}
