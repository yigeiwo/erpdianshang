import api from './api';
import type { ApiResponse, PageResult } from '../types';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  totalAmount: number;
  isActive: boolean;
}

export interface CreateSupplierDto {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  remark?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
  remark?: string;
}

export interface QuerySupplierDto {
  name?: string;
  contactPerson?: string;
  phone?: string;
  page?: number;
  pageSize?: number;
}

export const supplierService = {
  async getSuppliers(params: QuerySupplierDto): Promise<PageResult<Supplier>> {
    const response = await api.get<ApiResponse<PageResult<Supplier>>>('/suppliers', { params });
    return response.data.data!;
  },

  async getSupplier(id: string): Promise<Supplier> {
    const response = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return response.data.data!;
  },

  async createSupplier(data: CreateSupplierDto): Promise<Supplier> {
    const response = await api.post<ApiResponse<Supplier>>('/suppliers', data);
    return response.data.data!;
  },

  async updateSupplier(id: string, data: UpdateSupplierDto): Promise<Supplier> {
    const response = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    return response.data.data!;
  },

  async deleteSupplier(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },
};
