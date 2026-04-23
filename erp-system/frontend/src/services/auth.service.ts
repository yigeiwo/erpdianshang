import api from './api';
import type { LoginResponse, ApiResponse, User } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      username,
      password,
    });
    const { accessToken, refreshToken } = response.data.data!;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data.data!;
  },

  async register(data: {
    username: string;
    email: string;
    password: string;
    realName?: string;
  }): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
    const { accessToken, refreshToken } = response.data.data!;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data.data!;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  },

  async checkAuth(): Promise<boolean> {
    try {
      const response = await api.get('/auth/check');
      return response.data.authenticated;
    } catch {
      return false;
    }
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
