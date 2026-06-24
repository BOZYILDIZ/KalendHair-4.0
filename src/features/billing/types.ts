// Codex — Sprint 18 : types Billing Core

export type PlanCode = "ESSENTIAL" | "PRO" | "BUSINESS";
export type BillingCycleType = "MONTHLY" | "YEARLY";
export type OrgSubStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED";

export type BillingPlanView = {
  id:                string;
  code:              PlanCode;
  name:              string;
  description:       string | null;
  monthlyPriceCents: number;
  yearlyPriceCents:  number;
  maxSalons:         number | null;
  maxEmployees:      number | null;
  isActive:          boolean;
};

export type OrgSubscriptionView = {
  id:                 string;
  organizationId:     string;
  planCode:           PlanCode;
  billingCycle:       BillingCycleType;
  status:             OrgSubStatus;
  trialEndsAt:        Date | null;
  currentPeriodStart: Date;
  currentPeriodEnd:   Date;
  canceledAt:         Date | null;
  plan:               BillingPlanView;
};

export type QuotaStatus = {
  used:      number;
  limit:     number | null;
  remaining: number | null;
};

export type BillingQuota = {
  salons:    QuotaStatus;
  employees: QuotaStatus;
};

export type BillingDashboard = {
  subscription: OrgSubscriptionView | null;
  quota:        BillingQuota;
  plans:        BillingPlanView[];
};

export type UpgradePlanFormState = {
  error?:   string;
  success?: boolean;
} | null;
