import api from './api';
import type { ApiResponse, User, PageResult } from '../types';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  realName?: string;
  phone?: string;
}

export interface UpdateUserDto {
  realName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface QueryUserDto {
  username?: string;
  email?: string;
  page?: number;
  pageSize?: number;
}

export const userService = {
  async getUsers(params: QueryUserDto): Promise<PageResult<User>> {
    const response = await api.get<ApiResponse<PageResult<User>>>('/users', { params });
    return response.data.data!;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data!;
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data!;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
