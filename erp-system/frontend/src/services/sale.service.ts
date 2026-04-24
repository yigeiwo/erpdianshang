import api from './api';
import type { ApiResponse, PageResult } from '../types';

export interface SaleOrder {
  id: string;
  orderNo: string;
  customer: { id: string; name: string };
  warehouse: { id: string; name: string };
  totalAmount: number;
  finalAmount: number;
  discountAmount: number;
  status: string;
  orderDate: string;
  remark: string;
  items: SaleOrderItem[];
  creator: { id: string; username: string; realName: string };
  approver?: { id: string; username: string; realName: string };
}

export interface SaleOrderItem {
  id: string;
  product: { id: string; name: string; productCode: string };
  quantity: number;
  salePrice: number;
  taxRate: number;
  discountRate: number;
}

export interface CreateSaleOrderDto {
  customerId: string;
  warehouseId: string;
  discountAmount?: number;
  remark?: string;
  items: {
    productId: string;
    quantity: number;
    salePrice: number;
    taxRate?: number;
    discountRate?: number;
  }[];
}

export interface UpdateSaleOrderDto {
  discountAmount?: number;
  status?: string;
  remark?: string;
  items?: {
    productId: string;
    quantity: number;
    salePrice: number;
    taxRate?: number;
    discountRate?: number;
  }[];
}

export interface QuerySaleOrderDto {
  status?: string;
  customerId?: string;
  warehouseId?: string;
  orderNo?: string;
  page?: number;
  pageSize?: number;
}

export const saleService = {
  async getSales(params: QuerySaleOrderDto): Promise<PageResult<SaleOrder>> {
    const response = await api.get<ApiResponse<PageResult<SaleOrder>>>('/sales', { params });
    return response.data.data!;
  },

  async getSale(id: string): Promise<SaleOrder> {
    const response = await api.get<ApiResponse<SaleOrder>>(`/sales/${id}`);
    return response.data.data!;
  },

  async createSale(data: CreateSaleOrderDto): Promise<SaleOrder> {
    const response = await api.post<ApiResponse<SaleOrder>>('/sales', data);
    return response.data.data!;
  },

  async updateSale(id: string, data: UpdateSaleOrderDto): Promise<SaleOrder> {
    const response = await api.put<ApiResponse<SaleOrder>>(`/sales/${id}`, data);
    return response.data.data!;
  },

  async submitSale(id: string): Promise<SaleOrder> {
    const response = await api.post<ApiResponse<SaleOrder>>(`/sales/${id}/submit`, {});
    return response.data.data!;
  },

  async approveSale(id: string): Promise<SaleOrder> {
    const response = await api.post<ApiResponse<SaleOrder>>(`/sales/${id}/approve`, {});
    return response.data.data!;
  },

  async shipSale(id: string): Promise<SaleOrder> {
    const response = await api.post<ApiResponse<SaleOrder>>(`/sales/${id}/ship`, {});
    return response.data.data!;
  },
};