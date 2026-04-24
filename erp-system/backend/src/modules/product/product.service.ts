import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';
import { SaleItem } from '../sale/entities/sale-item.entity';
import { SaleOrder } from '../sale/entities/sale-order.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { productCode: dto.productCode },
    });
    if (existing) throw new ConflictException('Product code already exists');

    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findAll(query: QueryProductDto): Promise<{ list: Product[]; total: number }> {
    const { name, productCode, categoryId, supplierId, isActive, page = 1, pageSize = 10 } = query;
    const queryBuilder = this.productRepository.createQueryBuilder('p');

    if (name) queryBuilder.andWhere('p.name LIKE :name', { name: `%${name}%` });
    if (productCode) queryBuilder.andWhere('p.productCode LIKE :pc', { pc: `%${productCode}%` });
    if (categoryId) queryBuilder.andWhere('p.categoryId = :categoryId', { categoryId });
    if (supplierId) queryBuilder.andWhere('p.supplierId = :supplierId', { supplierId });
    if (isActive !== undefined) queryBuilder.andWhere('p.isActive = :isActive', { isActive });

    queryBuilder.leftJoinAndSelect('p.category', 'category');
    queryBuilder.leftJoinAndSelect('p.supplier', 'supplier');

    queryBuilder.loadRelationCountAndMap(
      'p.salesCount',
      'p.saleItems',
      'saleItem',
      (qb) => qb.andWhere('saleItem.saleOrder.status = :status', { status: 'completed' })
    );

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('p.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'supplier'],
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    await this.productRepository.increment({ id }, 'stock', quantity);
  }
}
