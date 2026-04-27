import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto, QuerySupplierDto } from './dto/supplier.dto';
import { buildLikePattern } from '../../common/utils';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  async findAll(query: QuerySupplierDto): Promise<{ list: Supplier[]; total: number }> {
    const { name, contactPerson, phone, page = 1, pageSize = 10 } = query;
    const queryBuilder = this.supplierRepository.createQueryBuilder('s');

    if (name) queryBuilder.andWhere('s.name LIKE :name', { name: buildLikePattern(name) });
    if (contactPerson) queryBuilder.andWhere('s.contactPerson LIKE :cp', { cp: buildLikePattern(contactPerson) });
    if (phone) queryBuilder.andWhere('s.phone LIKE :phone', { phone: buildLikePattern(phone) });

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('s.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total };
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    await this.supplierRepository.softRemove(supplier);
  }
}
