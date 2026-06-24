export type CommissionType = "PERCENTAGE" | "FIXED_AMOUNT";
export type CommissionEntryStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "ADJUSTED";

export type CommissionRuleView = {
  id: string;
  organizationId: string;
  salonId: string;
  employeeId: string | null;
  employeeName: string | null;
  serviceId: string | null;
  serviceName: string | null;
  productId: string | null;
  productName: string | null;
  type: CommissionType;
  value: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CommissionAdjustmentView = {
  id: string;
  deltaCents: number;
  reason: string;
  adjustedByName: string;
  createdAt: Date;
};

export type CommissionEntryView = {
  id: string;
  employeeId: string;
  employeeName: string;
  paymentId: string;
  paymentLineId: string | null;
  appointmentId: string | null;
  ruleId: string | null;
  type: CommissionType;
  baseAmountCents: number;
  commissionCents: number;
  netCommissionCents: number;
  status: CommissionEntryStatus;
  description: string;
  createdAt: Date;
  adjustments: CommissionAdjustmentView[];
};

export type CommissionSummary = {
  totalBaseCents: number;
  totalAdjustmentCents: number;
  netTotalCents: number;
  pendingCount: number;
  adjustedCount: number;
  cancelledCount: number;
};

export type CommissionEntriesPage = {
  entries: CommissionEntryView[];
  total: number;
  page: number;
  pageSize: number;
};

export type CommissionRulesPage = {
  active: CommissionRuleView[];
  inactive: CommissionRuleView[];
};

export type TopCommissionEmployee = {
  employeeId: string;
  firstName: string;
  lastName: string;
  color: string | null;
  commissionCents: number;
};

export type CommissionKpi = {
  totalCents: number;
  topEmployees: TopCommissionEmployee[];
};

export type CommissionOverview = {
  totalBaseCents: number;
  totalNetCents: number;
  entryCount: number;
  byEmployee: {
    employeeId: string;
    employeeName: string;
    baseCents: number;
    netCents: number;
    count: number;
  }[];
};

export type RuleFormState = { error?: string; success?: boolean };
export type AdjustFormState = { error?: string; success?: boolean };
