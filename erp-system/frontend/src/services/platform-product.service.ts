import api from './api';

export interface PlatformProduct {
  id: string;
  jijiaProductId: string;
  sku: string;
  name: string;
  briefName: string;
  category: string;
  categoryName: string;
  brand: string;
  brandName: string;
  productTypeName: string;
  unit: string;
  state: number;
  level: number;
  levelName: string;
  purchase: number;
  purchaseAccount: string;
  productManagerAccount: string;
  productManagerAccountId: string;
  productDeliveryDays: number;
  assembly: string;
  assemblyPackage: string;
  chineseCustomsName: string;
  englishCustomsName: string;
  customsCode: string;
  description: string;
  material: string;
  currencyCode: string;
  currencySymbol: string;
  smallImageUrl: string;
  packageL: number;
  packageW: number;
  packageH: number;
  packageWeight: number;
  singleProductSizeL: number;
  singleProductSizeW: number;
  singleProductSizeH: number;
  batteryAttribute: string;
  liquidAttribute: string;
  magneticAttribute: string;
  powderAttribute: string;
  chargedAttribute: string;
  woodenAttribute: string;
  clothing: number;
  isInspection: number;
  addDate: string;
  lastDate: string;
}

export interface ProductStatistics {
  total: number;
  activeTotal: number;
  categoryTop10: { category: string; count: number }[];
  lastSyncTime: string | null;
  isSyncing: boolean;
}

export interface QueryProductParams {
  sku?: string;
  name?: string;
  category?: string;
  brand?: string;
  page?: number;
  pageSize?: number;
}

export const platformProductService = {
  findAll: async (params: QueryProductParams) => {
    const response = await api.get('/platform-products', { params });
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get(`/platform-products/${id}`);
    return response.data;
  },

  findBySku: async (sku: string) => {
    const response = await api.get(`/platform-products/sku/${sku}`);
    return response.data;
  },

  getStatistics: async (): Promise<ProductStatistics> => {
    const response = await api.get('/platform-products/statistics');
    return response.data;
  },

  sync: async () => {
    const response = await api.post('/platform-products/sync');
    return response.data;
  },
};