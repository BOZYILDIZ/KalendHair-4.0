import type { AdminAction, DiscountType, OrgSubscriptionStatus, SubscriptionPlanCode, BillingCycle } from "@prisma/client";

export type AdminPayload = {
  sub: string;
  role: "SUPER_ADMIN";
};

export type BillingDiscountView = {
  id: string;
  type: DiscountType;
  value: number;
  reason: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  createdByAdminId: string;
};

export type OrgSubscriptionAdminView = {
  id: string;
  planCode: SubscriptionPlanCode;
  planName: string;
  billingCycle: BillingCycle;
  status: OrgSubscriptionStatus;
  isFree: boolean;
  freeReason: string | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date;
  activeDiscount: BillingDiscountView | null;
};

export type OrgAdminNote = {
  id: string;
  adminId: string;
  adminName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrgAdminView = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  suspensionReason: string | null;
  suspendedAt: Date | null;
  createdAt: Date;
  ownerEmail: string | null;
  salonCount: number;
  employeeCount: number;
  subscription: OrgSubscriptionAdminView | null;
  notes: OrgAdminNote[];
};

export type OrgListItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  ownerEmail: string | null;
  planCode: SubscriptionPlanCode | null;
  subStatus: OrgSubscriptionStatus | null;
  isFree: boolean;
};

export type MrrBreakdown = {
  total: number;
  byPlan: Record<SubscriptionPlanCode, number>;
};

export type SubscriptionStats = {
  total: number;
  byStatus: Record<OrgSubscriptionStatus, number>;
  freeCount: number;
  activeDiscountsCount: number;
  suspendedOrgsCount: number;
};

export type AdminAuditLogEntry = {
  id: string;
  action: AdminAction;
  adminName: string;
  targetOrgName: string | null;
  reason: string;
  details: unknown;
  createdAt: Date;
};

// Server Action state types
export type AdminActionState = {
  error?: string;
  success?: string;
};
