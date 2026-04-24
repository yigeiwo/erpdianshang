import api from './api';
import type { ApiResponse, PageResult } from '../types';

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  totalAmount: number;
  isActive: boolean;
}

export interface CreateCustomerDto {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  remark?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
  remark?: string;
}

export interface QueryCustomerDto {
  name?: string;
  contactPerson?: string;
  phone?: string;
  page?: number;
  pageSize?: number;
}

export const customerService = {
  async getCustomers(params: QueryCustomerDto): Promise<PageResult<Customer>> {
    const response = await api.get<ApiResponse<PageResult<Customer>>>('/customers', { params });
    return response.data.data!;
  },

  async getCustomer(id: string): Promise<Customer> {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data!;
  },

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await api.post<ApiResponse<Customer>>('/customers', data);
    return response.data.data!;
  },

  async updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data.data!;
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};