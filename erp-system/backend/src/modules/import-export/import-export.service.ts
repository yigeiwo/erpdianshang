import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { Customer } from '../customer/entities/customer.entity';

export interface ExportData {
  type: 'products' | 'suppliers' | 'customers';
  data: any[];
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async exportProducts(): Promise<ExportData> {
    const products = await this.productRepository.find({
      relations: ['category', 'supplier'],
    });

    const data = products.map((p) => ({
      productCode: p.productCode,
      name: p.name,
      barcode: p.barcode || '',
      category: p.category?.name || '',
      supplier: p.supplier?.name || '',
      unit: p.unit,
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      minStock: p.minStock,
      maxStock: p.maxStock,
      stock: p.stock,
      description: p.description || '',
      isActive: p.isActive,
    }));

    return { type: 'products', data };
  }

  async exportSuppliers(): Promise<ExportData> {
    const suppliers = await this.supplierRepository.find();

    const data = suppliers.map((s) => ({
      name: s.name,
      contactPerson: s.contactPerson || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      remark: s.remark || '',
      isActive: s.isActive,
    }));

    return { type: 'suppliers', data };
  }

  async exportCustomers(): Promise<ExportData> {
    const customers = await this.customerRepository.find();

    const data = customers.map((c) => ({
      name: c.name,
      contactPerson: c.contactPerson || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      remark: c.remark || '',
      isActive: c.isActive,
    }));

    return { type: 'customers', data };
  }

  async importProducts(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const row of data) {
      try {
        if (!row.productCode || !row.name) {
          result.errors.push(`缺少必填字段: ${JSON.stringify(row)}`);
          result.failed++;
          continue;
        }

        const existing = await this.productRepository.findOne({
          where: { productCode: row.productCode },
        });

        if (existing) {
          Object.assign(existing, {
            name: row.name,
            barcode: row.barcode,
            unit: row.unit || '件',
            costPrice: row.costPrice || 0,
            salePrice: row.salePrice || 0,
            minStock: row.minStock || 0,
            maxStock: row.maxStock || 0,
            description: row.description,
          });
          await this.productRepository.save(existing);
        } else {
          const product = this.productRepository.create({
            productCode: row.productCode,
            name: row.name,
            barcode: row.barcode,
            unit: row.unit || '件',
            costPrice: row.costPrice || 0,
            salePrice: row.salePrice || 0,
            minStock: row.minStock || 0,
            maxStock: row.maxStock || 0,
            description: row.description,
            isActive: row.isActive !== false,
          });
          await this.productRepository.save(product);
        }
        result.success++;
      } catch (error: any) {
        result.errors.push(`导入失败: ${JSON.stringify(row)} - ${error?.message || String(error)}`);
        result.failed++;
      }
    }

    return result;
  }

  async importSuppliers(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const row of data) {
      try {
        if (!row.name) {
          result.errors.push(`缺少必填字段: ${JSON.stringify(row)}`);
          result.failed++;
          continue;
        }

        const supplier = this.supplierRepository.create({
          name: row.name,
          contactPerson: row.contactPerson,
          phone: row.phone,
          email: row.email,
          address: row.address,
          remark: row.remark,
          isActive: row.isActive !== false,
        });
        await this.supplierRepository.save(supplier);
        result.success++;
      } catch (error: any) {
        result.errors.push(`导入失败: ${JSON.stringify(row)} - ${error?.message || String(error)}`);
        result.failed++;
      }
    }

    return result;
  }

  async importCustomers(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const row of data) {
      try {
        if (!row.name) {
          result.errors.push(`缺少必填字段: ${JSON.stringify(row)}`);
          result.failed++;
          continue;
        }

        const customer = this.customerRepository.create({
          name: row.name,
          contactPerson: row.contactPerson,
          phone: row.phone,
          email: row.email,
          address: row.address,
          remark: row.remark,
          isActive: row.isActive !== false,
        });
        await this.customerRepository.save(customer);
        result.success++;
      } catch (error: any) {
        result.errors.push(`导入失败: ${JSON.stringify(row)} - ${error?.message || String(error)}`);
        result.failed++;
      }
    }

    return result;
  }
}
