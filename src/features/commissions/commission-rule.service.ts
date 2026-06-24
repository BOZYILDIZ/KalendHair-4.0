import { prisma } from "@/lib/db/prisma";
import type { CommissionRuleView, CommissionRulesPage } from "./types";
import type {
  CreateCommissionRuleData,
  UpdateCommissionRuleData,
} from "./commission.schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type RawRule = {
  id: string;
  organizationId: string;
  salonId: string;
  employeeId: string | null;
  serviceId: string | null;
  productId: string | null;
  type: string;
  value: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  employee: { firstName: string; lastName: string } | null;
  service: { name: string } | null;
  product: { name: string } | null;
};

const RULE_SELECT = {
  id: true, organizationId: true, salonId: true,
  employeeId: true, serviceId: true, productId: true,
  type: true, value: true, isActive: true,
  createdAt: true, updatedAt: true,
  employee: { select: { firstName: true, lastName: true } },
  service:  { select: { name: true } },
  product:  { select: { name: true } },
} as const;

function toRuleView(r: RawRule): CommissionRuleView {
  return {
    id:             r.id,
    organizationId: r.organizationId,
    salonId:        r.salonId,
    employeeId:     r.employeeId,
    employeeName:   r.employee
      ? `${r.employee.firstName} ${r.employee.lastName}`.trim()
      : null,
    serviceId:      r.serviceId,
    serviceName:    r.service?.name ?? null,
    productId:      r.productId,
    productName:    r.product?.name ?? null,
    type:           r.type as CommissionRuleView["type"],
    value:          r.value,
    isActive:       r.isActive,
    createdAt:      r.createdAt,
    updatedAt:      r.updatedAt,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getCommissionRules(
  salonId: string,
  organizationId: string,
): Promise<CommissionRulesPage> {
  const rows = await prisma.commissionRule.findMany({
    where:   { salonId, organizationId },
    orderBy: { createdAt: "desc" },
    select:  RULE_SELECT,
  });

  const views = (rows as unknown as RawRule[]).map(toRuleView);
  return {
    active:   views.filter((r) => r.isActive),
    inactive: views.filter((r) => !r.isActive),
  };
}

export async function getCommissionRule(
  ruleId: string,
  salonId: string,
  organizationId: string,
): Promise<CommissionRuleView | null> {
  const row = await prisma.commissionRule.findFirst({
    where:  { id: ruleId, salonId, organizationId },
    select: RULE_SELECT,
  });
  if (!row) return null;
  return toRuleView(row as unknown as RawRule);
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCommissionRule(
  proUserId: string,
  salonId: string,
  organizationId: string,
  data: CreateCommissionRuleData,
): Promise<void> {
  await prisma.commissionRule.create({
    data: {
      organizationId,
      salonId,
      employeeId:        data.employeeId ?? null,
      serviceId:         data.serviceId  ?? null,
      productId:         data.productId  ?? null,
      type:              data.type as never,
      value:             data.value,
      createdByProUserId: proUserId,
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCommissionRule(
  ruleId: string,
  salonId: string,
  organizationId: string,
  data: UpdateCommissionRuleData,
): Promise<void> {
  const existing = await prisma.commissionRule.findFirst({
    where:  { id: ruleId, salonId, organizationId },
    select: { id: true },
  });
  if (!existing) throw new Error("Règle introuvable.");

  await prisma.commissionRule.update({
    where: { id: ruleId },
    data:  { type: data.type as never, value: data.value },
  });
}

// ─── Deactivate ───────────────────────────────────────────────────────────────

export async function deactivateCommissionRule(
  ruleId: string,
  salonId: string,
  organizationId: string,
): Promise<void> {
  const existing = await prisma.commissionRule.findFirst({
    where:  { id: ruleId, salonId, organizationId, isActive: true },
    select: { id: true },
  });
  if (!existing) throw new Error("Règle introuvable ou déjà désactivée.");

  await prisma.commissionRule.update({
    where: { id: ruleId },
    data:  { isActive: false },
  });
}
