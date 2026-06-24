import type { StockMovementType } from "@prisma/client";

export type ProductCategoryView = {
  id: string;
  name: string;
  isActive: boolean;
};

export type ProductView = {
  id: string;
  salonId: string;
  organizationId: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  unit: string;
  priceCents: number;
  costPriceCents: number | null;
  lowStockThreshold: number;
  isActive: boolean;
  currentStock: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductSummary = {
  id: string;
  name: string;
  unit: string;
  priceCents: number;
  currentStock: number | null;
  isActive: boolean;
};

export type StockMovementView = {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityDelta: number;
  quantityBefore: number;
  quantityAfter: number;
  costPriceCents: number | null;
  notes: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdByName: string | null;
  createdAt: Date;
};

export type LowStockProduct = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
};

export type InventoryDashboard = {
  totalProducts: number;
  activeProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
  recentMovements: StockMovementView[];
};

export type ProductsPage = {
  products: ProductView[];
  total: number;
  page: number;
  pageSize: number;
};

export type StockMovementsPage = {
  movements: StockMovementView[];
  total: number;
  page: number;
  pageSize: number;
};
