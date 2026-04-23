import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('spider_configs')
export class SpiderConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  platform: string;

  @Column({ length: 500 })
  startUrl: string;

  @Column({ name: 'allowed_domains', type: 'varchar', array: true, nullable: true })
  allowedDomains: string[];

  @Column({ type: 'jsonb', nullable: true })
  rules: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, string>;

  @Column({ name: 'proxy_enabled', default: false })
  proxyEnabled: boolean;

  @Column({ name: 'proxy_url', length: 500, nullable: true })
  proxyUrl: string;

  @Column({ name: 'delay_seconds', default: 2 })
  delaySeconds: number;

  @Column({ name: 'max_retries', default: 3 })
  maxRetries: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_run_at', nullable: true })
  lastRunAt: Date;

  @Column({ name: 'last_status', nullable: true })
  lastStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
