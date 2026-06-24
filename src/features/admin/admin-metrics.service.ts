import { prisma } from "@/lib/db/prisma";
import type { MrrBreakdown, SubscriptionStats } from "./types";
import type { OrgSubscriptionStatus, SubscriptionPlanCode } from "@prisma/client";

export async function getMrrBreakdown(): Promise<MrrBreakdown> {
  const activeSubs = await prisma.organizationSubscription.findMany({
    where: { status: "ACTIVE", isFree: false },
    select: {
      billingCycle: true,
      plan: {
        select: {
          code: true,
          monthlyPriceCents: true,
          yearlyPriceCents: true,
        },
      },
    },
  });

  const byPlan: Record<SubscriptionPlanCode, number> = {
    ESSENTIAL: 0,
    PRO: 0,
    BUSINESS: 0,
  };

  let total = 0;

  for (const sub of activeSubs) {
    const monthly =
      sub.billingCycle === "MONTHLY"
        ? sub.plan.monthlyPriceCents / 100
        : sub.plan.yearlyPriceCents / 1200;
    const code = sub.plan.code;
    byPlan[code] = (byPlan[code] ?? 0) + monthly;
    total += monthly;
  }

  return { total, byPlan };
}

export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const [allSubs, suspendedCount, activeDiscounts] = await Promise.all([
    prisma.organizationSubscription.findMany({
      select: { status: true, isFree: true },
    }),
    prisma.organization.count({ where: { isActive: false } }),
    prisma.billingDiscount.count({ where: { isActive: true } }),
  ]);

  const byStatus: Record<OrgSubscriptionStatus, number> = {
    TRIAL: 0,
    ACTIVE: 0,
    PAST_DUE: 0,
    CANCELED: 0,
  };
  let freeCount = 0;

  for (const sub of allSubs) {
    const s = sub.status;
    byStatus[s] = (byStatus[s] ?? 0) + 1;
    if (sub.isFree) freeCount++;
  }

  return {
    total: allSubs.length,
    byStatus,
    freeCount,
    activeDiscountsCount: activeDiscounts,
    suspendedOrgsCount: suspendedCount,
  };
}
