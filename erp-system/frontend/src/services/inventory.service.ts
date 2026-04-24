import api from './api';
import type { ApiResponse, PageResult } from '../types';

export interface Inventory {
  id: string;
  product: { id: string; name: string; productCode: string };
  warehouse: { id: string; name: string };
  quantity: number;
  availableQuantity: number;
  lockedQuantity: number;
  costPrice: number;
  lastCheckDate: string;
}

export interface InventoryLog {
  id: string;
  product: { id: string; name: string; productCode: string };
  warehouse: { id: string; name: string };
  type: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  orderNo: string;
  remark: string;
  creator: { id: string; username: string; realName: string };
  createdAt: string;
}

export interface AdjustInventoryDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  type: 'add' | 'reduce' | 'set';
  reason: string;
}

export interface QueryInventoryDto {
  productId?: string;
  warehouseId?: string;
  page?: number;
  pageSize?: number;
}

export const inventoryService = {
  async getInventory(params: QueryInventoryDto): Promise<PageResult<Inventory>> {
    const response = await api.get<ApiResponse<PageResult<Inventory>>>('/inventory', { params });
    return response.data.data!;
  },

  async getLogs(productId?: string, warehouseId?: string): Promise<InventoryLog[]> {
    const response = await api.get<ApiResponse<InventoryLog[]>>('/inventory/logs', {
      params: { productId, warehouseId },
    });
    return response.data.data!;
  },

  async adjustInventory(data: AdjustInventoryDto): Promise<Inventory> {
    const response = await api.post<ApiResponse<Inventory>>('/inventory/adjust', data);
    return response.data.data!;
  },
};