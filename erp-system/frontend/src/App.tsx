import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from './store';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductList from './pages/products/ProductList';
import SupplierList from './pages/suppliers/SupplierList';
import CustomerList from './pages/customers/CustomerList';
import WarehouseList from './pages/warehouses/WarehouseList';
import InventoryList from './pages/inventory/InventoryList';
import PurchaseList from './pages/purchases/PurchaseList';
import SaleList from './pages/sales/SaleList';
import FinancePage from './pages/finance/FinancePage';
import SettingsPage from './pages/settings/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductList />} />
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="warehouses" element={<WarehouseList />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="purchases" element={<PurchaseList />} />
            <Route path="sales" element={<SaleList />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
