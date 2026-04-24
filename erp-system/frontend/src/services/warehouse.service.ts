import api from './api';
import type { ApiResponse, PageResult } from '../types';

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  capacity: number;
  isActive: boolean;
}

export interface CreateWarehouseDto {
  name: string;
  address?: string;
  manager?: string;
  phone?: string;
  capacity?: number;
  remark?: string;
}

export interface UpdateWarehouseDto {
  name?: string;
  address?: string;
  manager?: string;
  phone?: string;
  capacity?: number;
  isActive?: boolean;
  remark?: string;
}

export interface QueryWarehouseDto {
  name?: string;
  page?: number;
  pageSize?: number;
}

export const warehouseService = {
  async getWarehouses(params: QueryWarehouseDto): Promise<PageResult<Warehouse>> {
    const response = await api.get<ApiResponse<PageResult<Warehouse>>>('/warehouses', { params });
    return response.data.data!;
  },

  async getWarehouse(id: string): Promise<Warehouse> {
    const response = await api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
    return response.data.data!;
  },

  async createWarehouse(data: CreateWarehouseDto): Promise<Warehouse> {
    const response = await api.post<ApiResponse<Warehouse>>('/warehouses', data);
    return response.data.data!;
  },

  async updateWarehouse(id: string, data: UpdateWarehouseDto): Promise<Warehouse> {
    const response = await api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
    return response.data.data!;
  },

  async deleteWarehouse(id: string): Promise<void> {
    await api.delete(`/warehouses/${id}`);
  },
};