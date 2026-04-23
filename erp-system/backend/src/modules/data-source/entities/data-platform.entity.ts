import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum PlatformType {
  TAOBAO = 'taobao',
  JD = 'jd',
  PINDUODUO = 'pinduoduo',
  SUNING = 'suning',
  DIYINPIN = 'diyinyin',
}

@Entity('data_platforms')
export class DataPlatform {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'enum', enum: PlatformType, unique: true })
  platform: PlatformType;

  @Column({ length: 200, nullable: true })
  apiUrl: string;

  @Column({ name: 'app_key', length: 100, nullable: true })
  appKey: string;

  @Column({ name: 'app_secret', length: 200, nullable: true })
  appSecret: string;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: 'sync_interval', default: 3600 })
  syncInterval: number;

  @Column({ name: 'last_sync_at', nullable: true })
  lastSyncAt: Date;

  @Column({ name: 'sync_status', default: 'idle' })
  syncStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
