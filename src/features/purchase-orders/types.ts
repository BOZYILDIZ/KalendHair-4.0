import type { PurchaseOrderStatus } from "@prisma/client";

export type PurchaseOrderLineView = {
  id: string;
  purchaseOrderId: string;
  productId: string;
  productName: string;
  productUnit: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityRemaining: number;
  unitCostCents: number;
  totalCostCents: number;
  notes: string | null;
};

export type PurchaseOrderReceiptLineView = {
  id: string;
  receiptId: string;
  purchaseOrderLineId: string;
  productId: string;
  productName: string;
  quantityReceived: number;
  unitCostCents: number;
  totalCostCents: number;
};

export type PurchaseOrderReceiptView = {
  id: string;
  purchaseOrderId: string;
  receivedAt: Date;
  notes: string | null;
  createdByName: string | null;
  lines: PurchaseOrderReceiptLineView[];
  createdAt: Date;
};

export type PurchaseOrderView = {
  id: string;
  salonId: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  reference: string | null;
  expectedAt: Date | null;
  notes: string | null;
  isActive: boolean;
  lines: PurchaseOrderLineView[];
  receipts: PurchaseOrderReceiptView[];
  totalOrderedCents: number;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PurchaseOrderSummary = {
  id: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  reference: string | null;
  lineCount: number;
  totalOrderedCents: number;
  expectedAt: Date | null;
  createdAt: Date;
};

export type PurchaseOrdersPage = {
  orders: PurchaseOrderSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type PurchaseOrderFormState = {
  error?: string;
  success?: boolean;
  orderId?: string;
} | null;

export type ReceiveStockFormState = { error?: string; success?: boolean } | null;
