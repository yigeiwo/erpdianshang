import api from './api';
import type { ApiResponse, PageResult } from '../types';

export interface Product {
  id: string;
  name: string;
  productCode: string;
  category?: { name: string };
  supplier?: { name: string };
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  isActive: boolean;
}

export interface CreateProductDto {
  name: string;
  productCode: string;
  barcode?: string;
  categoryId?: string;
  supplierId?: string;
  unit?: string;
  costPrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  barcode?: string;
  categoryId?: string;
  supplierId?: string;
  unit?: string;
  costPrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
  description?: string;
  imageUrl?: string;
}

export interface QueryProductDto {
  name?: string;
  productCode?: string;
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const productService = {
  async getProducts(params: QueryProductDto): Promise<PageResult<Product>> {
    const response = await api.get<ApiResponse<PageResult<Product>>>('/products', { params });
    return response.data.data!;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data!;
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await api.post<ApiResponse<Product>>('/products', data);
    return response.data.data!;
  },

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data!;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
