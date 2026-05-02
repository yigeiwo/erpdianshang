import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';
import { InventoryLog, InventoryLogType } from './entities/inventory-log.entity';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepository: Repository<Inventory>;
  let inventoryLogRepository: Repository<InventoryLog>;
  let dataSource: DataSource;

  const mockInventory: Inventory = {
    id: '1',
    productId: 'p1',
    warehouseId: 'w1',
    quantity: 100,
    availableQuantity: 90,
    lockedQuantity: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Inventory;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };

  const mockInventoryRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockInventoryLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockInventoryRepository,
        },
        {
          provide: getRepositoryToken(InventoryLog),
          useValue: mockInventoryLogRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    inventoryRepository = module.get<Repository<Inventory>>(getRepositoryToken(Inventory));
    inventoryLogRepository = module.get<Repository<InventoryLog>>(getRepositoryToken(InventoryLog));
    dataSource = module.get<DataSource>(DataSource);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated inventory list', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockInventory], 1]),
      };
      mockInventoryRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, pageSize: 10 });

      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('total');
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return inventory by productId and warehouseId', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(mockInventory);

      const result = await service.findOne('p1', 'w1');

      expect(result).toEqual(mockInventory);
    });

    it('should throw NotFoundException if inventory not found', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('p1', 'w1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjust', () => {
    const adjustDto = {
      productId: 'p1',
      warehouseId: 'w1',
      quantity: 50,
      remark: 'Stock adjustment',
    };

    it('should create new inventory if not exists', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(null);
      mockInventoryRepository.create.mockReturnValue({ ...adjustDto, quantity: 50, availableQuantity: 50, lockedQuantity: 0 });
      mockQueryRunner.manager.save.mockResolvedValue({ ...adjustDto, quantity: 50, availableQuantity: 50, lockedQuantity: 0, id: '1' });

      const result = await service.adjust(adjustDto, 'user1');

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.quantity).toBe(50);
    });

    it('should update existing inventory', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(mockInventory);
      mockQueryRunner.manager.save.mockResolvedValue({ ...mockInventory, quantity: 150, availableQuantity: 140 });

      const result = await service.adjust(adjustDto, 'user1');

      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(result.quantity).toBe(150);
    });

    it('should rollback on error', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(mockInventory);
      mockQueryRunner.manager.save.mockRejectedValue(new Error('DB error'));

      await expect(service.adjust(adjustDto, 'user1')).rejects.toThrow();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('getLogs', () => {
    it('should return inventory logs', async () => {
      const mockLog = {
        id: '1',
        productId: 'p1',
        warehouseId: 'w1',
        logType: InventoryLogType.ADJUST_IN,
        quantity: 50,
        beforeQuantity: 100,
        afterQuantity: 150,
        createdAt: new Date(),
      };

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockLog], 1]),
      };
      mockInventoryLogRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getLogs('p1', 'w1');

      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('total');
    });
  });
});
