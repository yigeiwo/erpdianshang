import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { SaleItem } from '../sale/entities/sale-item.entity';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;
  let saleItemRepository: Repository<SaleItem>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    productCode: 'TP001',
    barcode: '123456',
    categoryId: 'c1',
    supplierId: 's1',
    unit: '件',
    costPrice: 50,
    salePrice: 99.99,
    minStock: 10,
    maxStock: 1000,
    stock: 100,
    isActive: true,
    description: 'Test product',
    imageUrl: 'http://example.com/image.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as Product;

  const mockProductRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    increment: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockSaleItemRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(SaleItem),
          useValue: mockSaleItemRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    saleItemRepository = module.get<Repository<SaleItem>>(getRepositoryToken(SaleItem));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'New Product',
      productCode: 'NP001',
      salePrice: 50,
    };

    it('should create a new product successfully', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      mockProductRepository.create.mockReturnValue({ ...createDto, id: '2' });
      mockProductRepository.save.mockResolvedValue({ ...createDto, id: '2' });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', '2');
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { productCode: createDto.productCode },
      });
      expect(mockProductRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if product code exists', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    const query: QueryProductDto = { page: 1, pageSize: 10 };

    it('should return paginated products', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(query);

      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('total');
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return product by id', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['category', 'supplier'],
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = { name: 'Updated Product' };

    it('should update existing product', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({ ...mockProduct, ...updateDto });

      const result = await service.update('1', updateDto);

      expect(result.name).toBe('Updated Product');
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete product', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.softRemove.mockResolvedValue(undefined);

      await service.remove('1');

      expect(mockProductRepository.softRemove).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('updateStock', () => {
    it('should increment product stock', async () => {
      mockProductRepository.increment.mockResolvedValue(undefined);

      await service.updateStock('1', 10);

      expect(mockProductRepository.increment).toHaveBeenCalledWith(
        { id: '1' },
        'stock',
        10,
      );
    });
  });
});
