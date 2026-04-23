import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryLog, InventoryLogType } from './entities/inventory-log.entity';
import { QueryInventoryDto, CreateInventoryLogDto, AdjustInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryLog)
    private readonly inventoryLogRepository: Repository<InventoryLog>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: QueryInventoryDto): Promise<{ list: Inventory[]; total: number }> {
    const { productId, warehouseId, page = 1, pageSize = 10 } = query;
    const queryBuilder = this.inventoryRepository.createQueryBuilder('i');

    if (productId) queryBuilder.andWhere('i.productId = :productId', { productId });
    if (warehouseId) queryBuilder.andWhere('i.warehouseId = :warehouseId', { warehouseId });

    queryBuilder.leftJoinAndSelect('i.product', 'product');
    queryBuilder.leftJoinAndSelect('i.warehouse', 'warehouse');

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('i.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total };
  }

  async findOne(productId: string, warehouseId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId, warehouseId },
      relations: ['product', 'warehouse'],
    });
    if (!inventory) throw new NotFoundException('Inventory not found');
    return inventory;
  }

  async adjust(dto: AdjustInventoryDto, userId: string): Promise<Inventory> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let inventory = await this.inventoryRepository.findOne({
        where: { productId: dto.productId, warehouseId: dto.warehouseId },
      });

      const beforeQuantity = inventory?.quantity || 0;
      const isIncrease = dto.quantity > 0;
      const logType = isIncrease ? InventoryLogType.ADJUST_IN : InventoryLogType.ADJUST_OUT;

      if (!inventory) {
        inventory = this.inventoryRepository.create({
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          quantity: dto.quantity,
          availableQuantity: dto.quantity,
          lockedQuantity: 0,
        });
      } else {
        inventory.quantity += dto.quantity;
        inventory.availableQuantity += dto.quantity;
      }

      inventory = await queryRunner.manager.save(inventory);

      const log = this.inventoryLogRepository.create({
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        logType,
        quantity: Math.abs(dto.quantity),
        beforeQuantity,
        afterQuantity: inventory.quantity,
        remark: dto.remark,
        createdBy: userId,
      });

      await queryRunner.manager.save(log);
      await queryRunner.commitTransaction();

      return inventory;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getLogs(productId?: string, warehouseId?: string): Promise<{ list: InventoryLog[]; total: number }> {
    const queryBuilder = this.inventoryLogRepository.createQueryBuilder('l');

    if (productId) queryBuilder.andWhere('l.productId = :productId', { productId });
    if (warehouseId) queryBuilder.andWhere('l.warehouseId = :warehouseId', { warehouseId });

    queryBuilder.leftJoinAndSelect('l.product', 'product');
    queryBuilder.leftJoinAndSelect('l.warehouse', 'warehouse');

    const [list, total] = await queryBuilder
      .orderBy('l.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total };
  }
}
