import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { InventoryLog, InventoryLogType } from '../inventory/entities/inventory-log.entity';
import { Product } from '../product/entities/product.entity';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto } from './dto/purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepository: Repository<PurchaseItem>,
    @InjectRepository(InventoryLog)
    private readonly inventoryLogRepository: Repository<InventoryLog>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  private generateOrderNo(): string {
    const date = new Date();
    const prefix = 'PO';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${timestamp}-${random}`;
  }

  async create(dto: CreatePurchaseOrderDto, userId: string): Promise<PurchaseOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = this.purchaseRepository.create({
        orderNo: this.generateOrderNo(),
        supplierId: dto.supplierId,
        warehouseId: dto.warehouseId,
        discountAmount: dto.discountAmount || 0,
        status: PurchaseOrderStatus.DRAFT,
        orderDate: new Date(),
        createdBy: userId,
      });

      const savedOrder = await queryRunner.manager.save(order);

      let totalAmount = 0;
      for (const item of dto.items) {
        const taxAmount = (item.costPrice * item.quantity * (item.taxRate || 0)) / 100;
        const subtotal = item.costPrice * item.quantity + taxAmount;
        totalAmount += subtotal;

        const purchaseItem = this.purchaseItemRepository.create({
          purchaseOrderId: savedOrder.id,
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          unit: item.unit || '件',
          costPrice: item.costPrice,
          taxRate: item.taxRate || 0,
          taxAmount,
          subtotal,
          receivedQuantity: 0,
        });
        await queryRunner.manager.save(purchaseItem);
      }

      savedOrder.totalAmount = totalAmount;
      savedOrder.finalAmount = totalAmount - (dto.discountAmount || 0);
      await queryRunner.manager.save(savedOrder);

      await queryRunner.commitTransaction();
      return this.findOne(savedOrder.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryPurchaseOrderDto): Promise<{ list: PurchaseOrder[]; total: number }> {
    const { supplierId, status, orderNo, page = 1, pageSize = 10 } = query;
    const queryBuilder = this.purchaseRepository.createQueryBuilder('p');

    if (supplierId) queryBuilder.andWhere('p.supplierId = :supplierId', { supplierId });
    if (status) queryBuilder.andWhere('p.status = :status', { status });
    if (orderNo) queryBuilder.andWhere('p.orderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });

    queryBuilder.leftJoinAndSelect('p.supplier', 'supplier');
    queryBuilder.leftJoinAndSelect('p.warehouse', 'warehouse');
    queryBuilder.leftJoinAndSelect('p.items', 'items');
    queryBuilder.leftJoinAndSelect('items.product', 'product');

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('p.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total };
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseRepository.findOne({
      where: { id },
      relations: ['supplier', 'warehouse', 'items', 'items.product'],
    });
    if (!order) throw new NotFoundException(`Purchase order ${id} not found`);
    return order;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const order = await this.findOne(id);
    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new Error('Only draft orders can be updated');
    }
    Object.assign(order, dto);
    return this.purchaseRepository.save(order);
  }

  async submit(id: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id);
    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new Error('Only draft orders can be submitted');
    }
    order.status = PurchaseOrderStatus.PENDING;
    return this.purchaseRepository.save(order);
  }

  async approve(id: string, userId: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id);
    if (order.status !== PurchaseOrderStatus.PENDING) {
      throw new Error('Only pending orders can be approved');
    }
    order.status = PurchaseOrderStatus.APPROVED;
    order.approvedBy = userId;
    return this.purchaseRepository.save(order);
  }

  async completeIn(id: string, userId: string): Promise<PurchaseOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.findOne(id);
      if (order.status !== PurchaseOrderStatus.APPROVED) {
        throw new Error('Only approved orders can be completed');
      }

      for (const item of order.items) {
        const beforeQty = await this.getProductStock(item.productId, item.warehouseId);

        await queryRunner.manager.query(
          `INSERT INTO inventory (id, product_id, warehouse_id, quantity, available_quantity, locked_quantity, created_at, updated_at)
           VALUES (uuid_generate_v4(), $1, $2, $3, $3, 0, NOW(), NOW())
           ON CONFLICT (product_id, warehouse_id)
           DO UPDATE SET quantity = inventory.quantity + $3, available_quantity = inventory.available_quantity + $3, updated_at = NOW()`,
          [item.productId, item.warehouseId, item.quantity]
        );

        const log = this.inventoryLogRepository.create({
          productId: item.productId,
          warehouseId: item.warehouseId,
          logType: InventoryLogType.PURCHASE_IN,
          quantity: item.quantity,
          beforeQuantity: beforeQty,
          afterQuantity: beforeQty + item.quantity,
          orderId: order.id,
          orderType: 'purchase',
          createdBy: userId,
        });
        await queryRunner.manager.save(log);

        await queryRunner.manager.update(PurchaseItem, item.id, {
          receivedQuantity: item.quantity,
        });
      }

      order.status = PurchaseOrderStatus.COMPLETED;
      order.actualDate = new Date();
      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return this.findOne(savedOrder.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async getProductStock(productId: string, warehouseId: string): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT quantity FROM inventory WHERE product_id = $1 AND warehouse_id = $2`,
      [productId, warehouseId]
    );
    return result.length > 0 ? parseFloat(result[0].quantity) : 0;
  }
}
