import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataPlatform } from './entities/data-platform.entity';
import { DataSyncLog } from './entities/data-sync-log.entity';
import { SpiderConfig } from './entities/spider-config.entity';
import { DataSourceService } from './data-source.service';
import { DataSourceController } from './data-source.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DataPlatform, DataSyncLog, SpiderConfig])],
  controllers: [DataSourceController],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
