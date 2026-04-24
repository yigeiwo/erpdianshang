import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SaleOrder, SaleOrderStatus } from './entities/sale-order.entity';
import { SaleItem } from './entities/sale-item.entity';
import { InventoryLog, InventoryLogType } from '../inventory/entities/inventory-log.entity';
import { CreateSaleOrderDto, UpdateSaleOrderDto, QuerySaleOrderDto } from './dto/sale.dto';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(SaleOrder)
    private readonly saleRepository: Repository<SaleOrder>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
    @InjectRepository(InventoryLog)
    private readonly inventoryLogRepository: Repository<InventoryLog>,
    private readonly dataSource: DataSource,
  ) {}

  private generateOrderNo(): string {
    const date = new Date();
    const prefix = 'SO';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${timestamp}-${random}`;
  }

  async create(dto: CreateSaleOrderDto, userId: string): Promise<SaleOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = this.saleRepository.create({
        orderNo: this.generateOrderNo(),
        customerId: dto.customerId,
        warehouseId: dto.warehouseId,
        discountAmount: dto.discountAmount || 0,
        status: SaleOrderStatus.DRAFT,
        orderDate: new Date(),
        shippingAddress: dto.shippingAddress,
        receiverName: dto.receiverName,
        receiverPhone: dto.receiverPhone,
        createdBy: userId,
      });

      const savedOrder = await queryRunner.manager.save(order);

      let totalAmount = 0;
      let taxAmount = 0;

      for (const item of dto.items) {
        const itemTaxAmount = (item.salePrice * item.quantity * (item.taxRate || 0)) / 100;
        const subtotal = item.salePrice * item.quantity + itemTaxAmount;
        totalAmount += subtotal;
        taxAmount += itemTaxAmount;

        const saleItem = this.saleItemRepository.create({
          saleOrderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit || '件',
          salePrice: item.salePrice,
          taxRate: item.taxRate || 0,
          taxAmount: itemTaxAmount,
          subtotal,
          shippedQuantity: 0,
        });
        await queryRunner.manager.save(saleItem);
      }

      savedOrder.totalAmount = totalAmount;
      savedOrder.taxAmount = taxAmount;
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

  async findAll(query: QuerySaleOrderDto): Promise<{ list: SaleOrder[]; total: number }> {
    const { customerId, status, orderNo, page = 1, pageSize = 10 } = query;
    const queryBuilder = this.saleRepository.createQueryBuilder('s');

    if (customerId) queryBuilder.andWhere('s.customerId = :customerId', { customerId });
    if (status) queryBuilder.andWhere('s.status = :status', { status });
    if (orderNo) queryBuilder.andWhere('s.orderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });

    queryBuilder.leftJoinAndSelect('s.customer', 'customer');
    queryBuilder.leftJoinAndSelect('s.warehouse', 'warehouse');
    queryBuilder.leftJoinAndSelect('s.items', 'items');
    queryBuilder.leftJoinAndSelect('items.product', 'product');

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('s.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total };
  }

  async findOne(id: string): Promise<SaleOrder> {
    const order = await this.saleRepository.findOne({
      where: { id },
      relations: ['customer', 'warehouse', 'items', 'items.product'],
    });
    if (!order) throw new NotFoundException(`Sale order ${id} not found`);
    return order;
  }

  async update(id: string, dto: UpdateSaleOrderDto): Promise<SaleOrder> {
    const order = await this.findOne(id);
    if (order.status !== SaleOrderStatus.DRAFT) {
      throw new Error('Only draft orders can be updated');
    }
    Object.assign(order, dto);
    return this.saleRepository.save(order);
  }

  async submit(id: string): Promise<SaleOrder> {
    const order = await this.findOne(id);
    if (order.status !== SaleOrderStatus.DRAFT) {
      throw new Error('Only draft orders can be submitted');
    }
    order.status = SaleOrderStatus.PENDING;
    return this.saleRepository.save(order);
  }

  async approve(id: string, userId: string): Promise<SaleOrder> {
    const order = await this.findOne(id);
    if (order.status !== SaleOrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be approved');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        const result = await queryRunner.manager.query(
          `SELECT available_quantity FROM inventory WHERE product_id = $1 AND warehouse_id = $2`,
          [item.productId, order.warehouseId]
        );

        if (result.length === 0 || parseFloat(result[0].availableQuantity) < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
        }
      }

      order.status = SaleOrderStatus.APPROVED;
      order.approvedBy = userId;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return this.findOne(order.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async ship(id: string, userId: string): Promise<SaleOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.findOne(id);
      if (order.status !== SaleOrderStatus.APPROVED) {
        throw new BadRequestException('Only approved orders can be shipped');
      }

      for (const item of order.items) {
        const beforeQty = await this.getProductStock(item.productId, order.warehouseId);

        await queryRunner.manager.query(
          `UPDATE inventory SET quantity = quantity - $1, available_quantity = available_quantity - $1, updated_at = NOW()
           WHERE product_id = $2 AND warehouse_id = $3`,
          [item.quantity, item.productId, order.warehouseId]
        );

        const log = this.inventoryLogRepository.create({
          productId: item.productId,
          warehouseId: order.warehouseId,
          logType: InventoryLogType.SALE_OUT,
          quantity: item.quantity,
          beforeQuantity: beforeQty,
          afterQuantity: beforeQty - item.quantity,
          orderId: order.id,
          orderType: 'sale',
          createdBy: userId,
        });
        await queryRunner.manager.save(log);

        await queryRunner.manager.update(SaleItem, item.id, {
          shippedQuantity: item.quantity,
        });
      }

      order.status = SaleOrderStatus.IN_PROGRESS;
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
