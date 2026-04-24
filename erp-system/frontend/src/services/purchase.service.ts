import api from './api';
import type { ApiResponse, PageResult } from '../types';

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplier: { id: string; name: string };
  warehouse: { id: string; name: string };
  totalAmount: number;
  finalAmount: number;
  discountAmount: number;
  status: string;
  orderDate: string;
  remark: string;
  items: PurchaseOrderItem[];
  creator: { id: string; username: string; realName: string };
  approver?: { id: string; username: string; realName: string };
}

export interface PurchaseOrderItem {
  id: string;
  product: { id: string; name: string; productCode: string };
  quantity: number;
  costPrice: number;
  taxRate: number;
  unit: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  warehouseId: string;
  discountAmount?: number;
  remark?: string;
  items: {
    productId: string;
    warehouseId: string;
    quantity: number;
    costPrice: number;
    unit?: string;
    taxRate?: number;
  }[];
}

export interface UpdatePurchaseOrderDto {
  discountAmount?: number;
  status?: string;
  remark?: string;
}

export interface QueryPurchaseOrderDto {
  status?: string;
  supplierId?: string;
  orderNo?: string;
  page?: number;
  pageSize?: number;
}

export const purchaseService = {
  async getPurchases(params: QueryPurchaseOrderDto): Promise<PageResult<PurchaseOrder>> {
    const response = await api.get<ApiResponse<PageResult<PurchaseOrder>>>('/purchases', { params });
    return response.data.data!;
  },

  async getPurchase(id: string): Promise<PurchaseOrder> {
    const response = await api.get<ApiResponse<PurchaseOrder>>(`/purchases/${id}`);
    return response.data.data!;
  },

  async createPurchase(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const response = await api.post<ApiResponse<PurchaseOrder>>('/purchases', data);
    return response.data.data!;
  },

  async updatePurchase(id: string, data: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const response = await api.put<ApiResponse<PurchaseOrder>>(`/purchases/${id}`, data);
    return response.data.data!;
  },

  async approvePurchase(id: string): Promise<PurchaseOrder> {
    const response = await api.post<ApiResponse<PurchaseOrder>>(`/purchases/${id}/approve`, {});
    return response.data.data!;
  },

  async completeIn(id: string): Promise<PurchaseOrder> {
    const response = await api.post<ApiResponse<PurchaseOrder>>(`/purchases/${id}/complete`, {});
    return response.data.data!;
  },
};