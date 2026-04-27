import api from './api';

export interface PlatformOrder {
  id: string;
  platformOrderId: string;
  platformOrderLineId: string;
  orderingTime: string;
  paymentTime: string;
  platformId: string;
  platformName: string;
  erpShopId: string;
  erpShopName: string;
  regionCnName: string;
  orderStatus: string;
  orderStatusName: string;
  deliveryStatus: number;
  totalAmount: number;
  buyerPayAmount: number;
  buyerAccountName: string;
  receiverName: string;
  receiverPhone: string;
  receiverMobilePhone: string;
  receiverCountry: string;
  receiverState: string;
  receiverCity: string;
  receiverAddressDetail1: string;
  receiverAddressDetail2: string;
  receiverPostCode: string;
  sku: string;
  msku: string;
  skuName: string;
  productName: string;
  buyQuantity: number;
  productUnitPrice: number;
  productImageUrl: string;
  trackingNumber: string;
  buyerMessage: string;
}

export interface PlatformOrderStatistics {
  totalOrders: number;
  todayOrders: number;
  totalAmount: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

export interface QueryPlatformOrderParams {
  platformId?: string;
  shopId?: string;
  orderStatus?: string;
  sku?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface SyncParams {
  startDate?: string;
  endDate?: string;
  backtrackDays?: number;
}

export const platformOrderService = {
  findAll: async (params: QueryPlatformOrderParams) => {
    const response = await api.get('/platform-orders', { params });
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get(`/platform-orders/${id}`);
    return response.data;
  },

  getStatistics: async (): Promise<PlatformOrderStatistics> => {
    const response = await api.get('/platform-orders/statistics');
    return response.data;
  },

  syncFromJiJia: async (params: SyncParams) => {
    const response = await api.post('/platform-orders/sync', null, { params });
    return response.data;
  },
};