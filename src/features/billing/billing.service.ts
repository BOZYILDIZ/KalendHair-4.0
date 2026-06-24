import { prisma } from "@/lib/db/prisma";
import type { SubscriptionPlanCode, BillingCycle } from "@prisma/client";
import type {
  BillingPlanView,
  OrgSubscriptionView,
  BillingQuota,
  BillingDashboard,
  PlanCode,
} from "./types";

// Fonctionnalités bloquées par plan — ESSENTIAL exclut les modules premium
const ESSENTIAL_BLOCKED = new Set(["kpi", "inventory", "suppliers", "payments"]);

// ─── Helpers de mapping ──────────────────────────────────────────────────────

function mapPlan(p: {
  id: string;
  code: SubscriptionPlanCode;
  name: string;
  description: string | null;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  maxSalons: number | null;
  maxEmployees: number | null;
  isActive: boolean;
}): BillingPlanView {
  return {
    id:                p.id,
    code:              p.code as PlanCode,
    name:              p.name,
    description:       p.description,
    monthlyPriceCents: p.monthlyPriceCents,
    yearlyPriceCents:  p.yearlyPriceCents,
    maxSalons:         p.maxSalons,
    maxEmployees:      p.maxEmployees,
    isActive:          p.isActive,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getCurrentSubscription(
  organizationId: string,
): Promise<OrgSubscriptionView | null> {
  const sub = await prisma.organizationSubscription.findUnique({
    where:   { organizationId },
    include: { plan: true },
  });
  if (!sub) return null;

  return {
    id:                 sub.id,
    organizationId:     sub.organizationId,
    planCode:           sub.plan.code as PlanCode,
    billingCycle:       sub.billingCycle as "MONTHLY" | "YEARLY",
    status:             sub.status as "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED",
    trialEndsAt:        sub.trialEndsAt,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd:   sub.currentPeriodEnd,
    canceledAt:         sub.canceledAt,
    plan:               mapPlan(sub.plan),
  };
}

export async function getSubscriptionPlan(
  planCode: PlanCode,
): Promise<BillingPlanView | null> {
  const plan = await prisma.billingPlan.findUnique({
    where: { code: planCode as SubscriptionPlanCode },
  });
  return plan ? mapPlan(plan) : null;
}

export async function getActivePlans(): Promise<BillingPlanView[]> {
  const plans = await prisma.billingPlan.findMany({
    where:   { isActive: true },
    orderBy: { monthlyPriceCents: "asc" },
  });
  return plans.map(mapPlan);
}

// ─── Quotas ───────────────────────────────────────────────────────────────────

export async function canCreateSalon(organizationId: string): Promise<boolean> {
  const sub = await getCurrentSubscription(organizationId);
  if (!sub || sub.plan.maxSalons === null) return true;
  const count = await prisma.salon.count({ where: { organizationId, isActive: true } });
  return count < sub.plan.maxSalons;
}

export async function canCreateEmployee(organizationId: string): Promise<boolean> {
  const sub = await getCurrentSubscription(organizationId);
  if (!sub || sub.plan.maxEmployees === null) return true;
  const count = await prisma.employee.count({ where: { organizationId, isActive: true } });
  return count < sub.plan.maxEmployees;
}

export async function getRemainingQuota(organizationId: string): Promise<BillingQuota> {
  const sub = await getCurrentSubscription(organizationId);
  const maxSalons    = sub?.plan.maxSalons    ?? null;
  const maxEmployees = sub?.plan.maxEmployees ?? null;

  const [salonCount, employeeCount] = await Promise.all([
    prisma.salon.count({    where: { organizationId, isActive: true } }),
    prisma.employee.count({ where: { organizationId, isActive: true } }),
  ]);

  return {
    salons: {
      used:      salonCount,
      limit:     maxSalons,
      remaining: maxSalons !== null ? Math.max(0, maxSalons - salonCount) : null,
    },
    employees: {
      used:      employeeCount,
      limit:     maxEmployees,
      remaining: maxEmployees !== null ? Math.max(0, maxEmployees - employeeCount) : null,
    },
  };
}

// ─── Fonctionnalités ──────────────────────────────────────────────────────────

export async function isFeatureEnabled(
  organizationId: string,
  feature: "kpi" | "inventory" | "suppliers" | "payments",
): Promise<boolean> {
  const sub = await getCurrentSubscription(organizationId);
  // Pas d'abonnement = toutes les fonctionnalités accessibles (backward compat)
  if (!sub) return true;
  if (sub.planCode === "PRO" || sub.planCode === "BUSINESS") return true;
  return !ESSENTIAL_BLOCKED.has(feature);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getBillingDashboard(
  organizationId: string,
): Promise<BillingDashboard> {
  const [subscription, quota, plans] = await Promise.all([
    getCurrentSubscription(organizationId),
    getRemainingQuota(organizationId),
    getActivePlans(),
  ]);
  return { subscription, quota, plans };
}

// ─── Write (simulation — pas de Stripe) ──────────────────────────────────────

export async function upsertSubscription(
  organizationId: string,
  planCode: PlanCode,
  billingCycle: "MONTHLY" | "YEARLY",
): Promise<void> {
  const plan = await prisma.billingPlan.findUnique({
    where:  { code: planCode as SubscriptionPlanCode },
    select: { id: true },
  });
  if (!plan) throw new Error(`Plan introuvable : ${planCode}`);

  const now          = new Date();
  const periodMonths = billingCycle === "YEARLY" ? 12 : 1;
  const periodEnd    = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + periodMonths);

  await prisma.organizationSubscription.upsert({
    where:  { organizationId },
    update: {
      planId:             plan.id,
      billingCycle:       billingCycle as BillingCycle,
      status:             "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd:   periodEnd,
      canceledAt:         null,
    },
    create: {
      organizationId,
      planId:             plan.id,
      billingCycle:       billingCycle as BillingCycle,
      status:             "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd:   periodEnd,
    },
  });
}
