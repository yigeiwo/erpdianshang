import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DataPlatform } from './data-platform.entity';

export enum SyncStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum SyncType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  MANUAL = 'manual',
}

@Entity('data_sync_logs')
export class DataSyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'platform_id' })
  platformId: string;

  @ManyToOne(() => DataPlatform)
  @JoinColumn({ name: 'platform_id' })
  platform: DataPlatform;

  @Column({ type: 'enum', enum: SyncType })
  syncType: SyncType;

  @Column({ type: 'enum', enum: SyncStatus, default: SyncStatus.PENDING })
  status: SyncStatus;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ name: 'items_synced', default: 0 })
  itemsSynced: number;

  @Column({ name: 'items_failed', default: 0 })
  itemsFailed: number;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
