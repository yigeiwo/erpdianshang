export { default as api } from './api';
export { authService } from './auth.service';
export { userService } from './user.service';
export { productService } from './product.service';
export { supplierService } from './supplier.service';
export { customerService } from './customer.service';
export { warehouseService } from './warehouse.service';
export { purchaseService } from './purchase.service';
export { saleService } from './sale.service';
export { inventoryService } from './inventory.service';
export { analyticsService } from './analytics.service';
export { platformOrderService } from './platform-order.service';
export { platformInventoryService } from './platform-inventory.service';
export { platformProductService } from './platform-product.service';
export type {
  PlatformInventory,
  InventoryStatistics,
  WarehouseSummary,
  QueryInventoryParams,
} from './platform-inventory.service';
export type {
  PlatformOrder,
  PlatformOrderStatistics,
  QueryPlatformOrderParams,
} from './platform-order.service';
export type {
  PlatformProduct,
  ProductStatistics,
  QueryProductParams,
} from './platform-product.service';
export type {
  DashboardStats,
  SalesTrend,
  CategorySales,
  InventoryStats,
  TopProduct,
  ProfitAnalysis,
} from './analytics.service';
export type { CreateUserDto, UpdateUserDto, QueryUserDto } from './user.service';
export type { CreateProductDto, UpdateProductDto, QueryProductDto, Product } from './product.service';
export type { CreateSupplierDto, UpdateSupplierDto, QuerySupplierDto, Supplier } from './supplier.service';
export type { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto, Customer } from './customer.service';
export type { CreateWarehouseDto, UpdateWarehouseDto, QueryWarehouseDto, Warehouse } from './warehouse.service';
export type { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto, PurchaseOrder, PurchaseOrderItem } from './purchase.service';
export type { CreateSaleOrderDto, UpdateSaleOrderDto, QuerySaleOrderDto, SaleOrder, SaleOrderItem } from './sale.service';
export type { QueryInventoryDto, AdjustInventoryDto, Inventory, InventoryLog } from './inventory.service';