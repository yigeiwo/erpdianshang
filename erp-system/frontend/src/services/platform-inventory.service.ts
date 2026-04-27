import api from './api';

export interface PlatformInventory {
  id: string;
  platform: string;
  warehouseId: string;
  warehouseName: string;
  sku: string;
  spu: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  available: number;
  allocated: number;
  blocked: number;
  reserved: number;
  returnQuantity: number;
  total: number;
  unit: string;
  statusName: string;
  brandName: string;
  categoryName: string;
  productType: string;
  supplyModeName: string;
  avgUnitsOrdered7Days: number;
  avgUnitsOrdered15Days: number;
  avgUnitsOrdered30Days: number;
  singleQuantity: number;
  productDeliveryDays: number;
  productManagerAccountName: string;
  updateTime: string;
}

export interface InventoryStatistics {
  cdTotal: number;
  emagTotal: number;
  cdAvailable: number;
  emagAvailable: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

export interface WarehouseSummary {
  platform: string;
  warehouseName: string;
  skuCount: number;
  available: number;
  total: number;
}

export interface QueryInventoryParams {
  platform?: string;
  warehouse?: string;
  sku?: string;
  productName?: string;
  page?: number;
  pageSize?: number;
}

export const platformInventoryService = {
  findAll: async (params: QueryInventoryParams) => {
    const response = await api.get('/platform-inventory', { params });
    return response.data;
  },

  getStatistics: async (): Promise<InventoryStatistics> => {
    const response = await api.get('/platform-inventory/statistics');
    return response.data;
  },

  getWarehouseSummary: async (): Promise<WarehouseSummary[]> => {
    const response = await api.get('/platform-inventory/warehouse-summary');
    return response.data;
  },

  sync: async () => {
    const response = await api.post('/platform-inventory/sync');
    return response.data;
  },
};