import api from './api';

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  pendingPurchases: number;
  completedPurchases: number;
  pendingSales: number;
  completedSales: number;
  monthlyPurchases: number;
  monthlySales: number;
  yearlyPurchases: number;
  yearlySales: number;
}

export interface SalesTrend {
  date: string;
  amount: number;
  count: number;
}

export interface CategorySales {
  category: string;
  amount: number;
  orderCount: number;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  productCode: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface ProfitAnalysis {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export const analyticsService = {
  async getDashboard(): Promise<DashboardStats> {
    const response = await api.get('/analytics/dashboard');
    return response.data.data;
  },

  async getSalesTrend(days = 30): Promise<SalesTrend[]> {
    const response = await api.get('/analytics/sales-trend', { params: { days } });
    return response.data.data;
  },

  async getSalesByCategory(): Promise<CategorySales[]> {
    const response = await api.get('/analytics/sales-by-category');
    return response.data.data;
  },

  async getInventoryStats(): Promise<InventoryStats> {
    const response = await api.get('/analytics/inventory-stats');
    return response.data.data;
  },

  async getTopProducts(limit = 10, type: 'sales' | 'purchases' = 'sales'): Promise<TopProduct[]> {
    const response = await api.get('/analytics/top-products', { params: { limit, type } });
    return response.data.data;
  },

  async getProfitAnalysis(): Promise<ProfitAnalysis> {
    const response = await api.get('/analytics/profit-analysis');
    return response.data.data;
  },
};
