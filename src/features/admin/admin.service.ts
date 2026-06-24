import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "./admin-audit.service";
import type { Prisma } from "@prisma/client";
import type {
  OrgAdminView,
  OrgListItem,
  AdminAuditLogEntry,
} from "./types";
import type { CreateDiscountData } from "./admin.schema";

// ─── Lecture ─────────────────────────────────────────────────────────────────

export async function getAllOrganizations(): Promise<OrgListItem[]> {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
      proUsers: {
        where: { role: "OWNER" },
        select: { email: true },
        take: 1,
      },
      orgSubscription: {
        select: {
          status: true,
          isFree: true,
          plan: { select: { code: true } },
        },
      },
    },
  });

  return orgs.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    isActive: o.isActive,
    createdAt: o.createdAt,
    ownerEmail: o.proUsers[0]?.email ?? null,
    planCode: o.orgSubscription?.plan.code ?? null,
    subStatus: o.orgSubscription?.status ?? null,
    isFree: o.orgSubscription?.isFree ?? false,
  }));
}

export async function getOrganizationById(
  orgId: string,
): Promise<OrgAdminView | null> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      suspensionReason: true,
      suspendedAt: true,
      createdAt: true,
      proUsers: {
        where: { role: "OWNER" },
        select: { email: true },
        take: 1,
      },
      salons: { where: { isActive: true }, select: { id: true } },
      employees: { where: { isActive: true }, select: { id: true } },
      orgSubscription: {
        select: {
          id: true,
          status: true,
          isFree: true,
          freeReason: true,
          trialEndsAt: true,
          currentPeriodEnd: true,
          billingCycle: true,
          plan: { select: { code: true, name: true } },
          discounts: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              type: true,
              value: true,
              reason: true,
              startDate: true,
              endDate: true,
              isActive: true,
              createdAt: true,
              createdByAdminId: true,
            },
          },
        },
      },
      adminNotes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          adminId: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          admin: { select: { name: true } },
        },
      },
    },
  });

  if (!org) return null;

  const sub = org.orgSubscription;
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    isActive: org.isActive,
    suspensionReason: org.suspensionReason,
    suspendedAt: org.suspendedAt,
    createdAt: org.createdAt,
    ownerEmail: org.proUsers[0]?.email ?? null,
    salonCount: org.salons.length,
    employeeCount: org.employees.length,
    subscription: sub
      ? {
          id: sub.id,
          planCode: sub.plan.code,
          planName: sub.plan.name,
          billingCycle: sub.billingCycle,
          status: sub.status,
          isFree: sub.isFree,
          freeReason: sub.freeReason,
          trialEndsAt: sub.trialEndsAt,
          currentPeriodEnd: sub.currentPeriodEnd,
          activeDiscount: sub.discounts[0] ?? null,
        }
      : null,
    notes: org.adminNotes.map((n) => ({
      id: n.id,
      adminId: n.adminId,
      adminName: n.admin.name,
      content: n.content,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
  };
}

export async function getAdminAuditLogs(
  orgId?: string,
  limit = 50,
): Promise<AdminAuditLogEntry[]> {
  const logs = await prisma.adminAuditLog.findMany({
    where: orgId ? { targetOrgId: orgId } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      reason: true,
      details: true,
      createdAt: true,
      admin: { select: { name: true } },
      targetOrg: { select: { name: true } },
    },
  });

  return logs.map((l) => ({
    id: l.id,
    action: l.action,
    adminName: l.admin.name,
    targetOrgName: l.targetOrg?.name ?? null,
    reason: l.reason,
    details: l.details,
    createdAt: l.createdAt,
  }));
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function changeOrganizationPlan(
  adminId: string,
  orgId: string,
  planCode: string,
  billingCycle: "MONTHLY" | "YEARLY",
  reason: string,
): Promise<void> {
  const sub = await prisma.organizationSubscription.findUnique({
    where: { organizationId: orgId },
    select: { id: true, plan: { select: { code: true } }, billingCycle: true },
  });
  if (!sub) throw new Error("Aucun abonnement trouvé pour cette organisation.");

  const newPlan = await prisma.billingPlan.findUnique({
    where: { code: planCode as "ESSENTIAL" | "PRO" | "BUSINESS" },
    select: { id: true },
  });
  if (!newPlan) throw new Error(`Plan introuvable : ${planCode}`);

  const now = new Date();
  const months = billingCycle === "YEARLY" ? 12 : 1;
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + months);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.organizationSubscription.update({
      where: { organizationId: orgId },
      data: {
        planId: newPlan.id,
        billingCycle,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
    await logAdminAction(tx, adminId, "CHANGE_PLAN", orgId, reason, {
      before: { planCode: sub.plan.code, billingCycle: sub.billingCycle },
      after: { planCode, billingCycle },
    });
  });
}

export async function grantFreePlan(
  adminId: string,
  orgId: string,
  reason: string,
): Promise<void> {
  const sub = await prisma.organizationSubscription.findUnique({
    where: { organizationId: orgId },
    select: { id: true, isFree: true },
  });
  if (!sub) throw new Error("Aucun abonnement trouvé.");
  if (sub.isFree) throw new Error("L'organisation bénéficie déjà d'un plan gratuit.");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.organizationSubscription.update({
      where: { organizationId: orgId },
      data: { isFree: true, freeReason: reason },
    });
    await logAdminAction(tx, adminId, "GRANT_FREE_PLAN", orgId, reason, {
      isFree: true,
    });
  });
}

export async function revokeFreePlan(
  adminId: string,
  orgId: string,
  reason: string,
): Promise<void> {
  const sub = await prisma.organizationSubscription.findUnique({
    where: { organizationId: orgId },
    select: { id: true, isFree: true },
  });
  if (!sub) throw new Error("Aucun abonnement trouvé.");
  if (!sub.isFree) throw new Error("L'organisation n'est pas en plan gratuit.");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.organizationSubscription.update({
      where: { organizationId: orgId },
      data: { isFree: false, freeReason: null },
    });
    await logAdminAction(tx, adminId, "REVOKE_FREE_PLAN", orgId, reason, {
      isFree: false,
    });
  });
}

export async function createDiscount(
  adminId: string,
  orgId: string,
  data: CreateDiscountData,
  subscriptionId: string,
): Promise<void> {
  const existing = await prisma.billingDiscount.findFirst({
    where: { subscriptionId, isActive: true },
  });
  if (existing) throw new Error("Une remise active existe déjà sur cet abonnement.");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.billingDiscount.create({
      data: {
        subscriptionId,
        type: data.type,
        value: data.value,
        reason: data.reason,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdByAdminId: adminId,
      },
    });
    await logAdminAction(tx, adminId, "CREATE_DISCOUNT", orgId, data.reason, {
      type: data.type,
      value: data.value,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
    });
  });
}

export async function deactivateDiscount(
  adminId: string,
  orgId: string,
  discountId: string,
  reason: string,
): Promise<void> {
  const discount = await prisma.billingDiscount.findUnique({
    where: { id: discountId },
    select: { id: true, isActive: true },
  });
  if (!discount) throw new Error("Remise introuvable.");
  if (!discount.isActive) throw new Error("Cette remise est déjà désactivée.");

  const now = new Date();
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.billingDiscount.update({
      where: { id: discountId },
      data: {
        isActive: false,
        deactivatedAt: now,
        deactivatedByAdminId: adminId,
      },
    });
    await logAdminAction(tx, adminId, "DEACTIVATE_DISCOUNT", orgId, reason, {
      discountId,
    });
  });
}

export async function suspendOrganization(
  adminId: string,
  orgId: string,
  reason: string,
): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { isActive: true },
  });
  if (!org) throw new Error("Organisation introuvable.");
  if (!org.isActive) throw new Error("Organisation déjà suspendue.");

  const now = new Date();
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.organization.update({
      where: { id: orgId },
      data: {
        isActive: false,
        suspensionReason: reason,
        suspendedAt: now,
        suspendedByAdminId: adminId,
      },
    });
    await logAdminAction(tx, adminId, "SUSPEND_ORGANIZATION", orgId, reason, {
      wasActive: true,
      suspendedAt: now.toISOString(),
    });
  });
}

export async function reactivateOrganization(
  adminId: string,
  orgId: string,
  reason: string,
): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { isActive: true },
  });
  if (!org) throw new Error("Organisation introuvable.");
  if (org.isActive) throw new Error("Organisation non suspendue.");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.organization.update({
      where: { id: orgId },
      data: {
        isActive: true,
        suspensionReason: null,
        suspendedAt: null,
        suspendedByAdminId: null,
      },
    });
    await logAdminAction(tx, adminId, "REACTIVATE_ORGANIZATION", orgId, reason, {
      reactivated: true,
    });
  });
}

export async function extendTrial(
  adminId: string,
  orgId: string,
  newTrialEndsAt: Date,
  reason: string,
): Promise<void> {
  const sub = await prisma.organizationSubscription.findUnique({
    where: { organizationId: orgId },
    select: { trialEndsAt: true },
  });
  if (!sub) throw new Error("Aucun abonnement trouvé.");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.organizationSubscription.update({
      where: { organizationId: orgId },
      data: { trialEndsAt: newTrialEndsAt },
    });
    await logAdminAction(tx, adminId, "EXTEND_TRIAL", orgId, reason, {
      before: sub.trialEndsAt?.toISOString() ?? null,
      after: newTrialEndsAt.toISOString(),
    });
  });
}

export async function addOrganizationNote(
  adminId: string,
  orgId: string,
  content: string,
): Promise<void> {
  await prisma.organizationAdminNote.create({
    data: { organizationId: orgId, adminId, content },
  });
}

// ─── Impersonation ────────────────────────────────────────────────────────────

export async function startImpersonation(
  adminId: string,
  orgId: string,
): Promise<string> {
  const log = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const entry = await tx.adminImpersonationLog.create({
      data: { adminId, organizationId: orgId },
    });
    await logAdminAction(
      tx,
      adminId,
      "ADMIN_IMPERSONATION_START",
      orgId,
      "Impersonation démarrée",
      { impersonationLogId: entry.id },
    );
    return entry;
  });
  return log.id;
}

export async function endImpersonation(
  adminId: string,
  orgId: string,
  impersonationLogId: string,
): Promise<void> {
  const now = new Date();
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.adminImpersonationLog.update({
      where: { id: impersonationLogId },
      data: { endedAt: now },
    });
    await logAdminAction(
      tx,
      adminId,
      "ADMIN_IMPERSONATION_END",
      orgId,
      "Impersonation terminée",
      { impersonationLogId, endedAt: now.toISOString() },
    );
  });
}
