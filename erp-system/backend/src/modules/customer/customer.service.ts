import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto } from './dto/customer.dto';
import { buildLikePattern } from '../../common/utils';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async findAll(query: QueryCustomerDto): Promise<{ list: Customer[]; total: number }> {
    const { name, contactPerson, phone, page = 1, pageSize = 10 } = query;
    const queryBuilder = this.customerRepository.createQueryBuilder('c');

    if (name) queryBuilder.andWhere('c.name LIKE :name', { name: buildLikePattern(name) });
    if (contactPerson) queryBuilder.andWhere('c.contactPerson LIKE :cp', { cp: buildLikePattern(contactPerson) });
    if (phone) queryBuilder.andWhere('c.phone LIKE :phone', { phone: buildLikePattern(phone) });

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('c.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.softRemove(customer);
  }
}
