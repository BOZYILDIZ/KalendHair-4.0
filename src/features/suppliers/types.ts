export type SupplierView = {
  id: string;
  salonId: string;
  organizationId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SupplierSummary = {
  id: string;
  name: string;
  isActive: boolean;
};

export type SuppliersPage = {
  suppliers: SupplierView[];
  total: number;
  page: number;
  pageSize: number;
};

export type SupplierFormState = { error?: string; success?: boolean } | null;
