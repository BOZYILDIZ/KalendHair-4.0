import { prisma } from "@/lib/db/prisma";
import type {
  CommissionEntryView,
  CommissionAdjustmentView,
  CommissionSummary,
  CommissionEntriesPage,
  CommissionOverview,
} from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

type RawAdj = {
  id: string;
  deltaCents: number;
  reason: string;
  createdAt: Date;
  adjustedBy: { firstName: string; lastName: string };
};

type RawEntry = {
  id: string;
  employeeId: string;
  paymentId: string;
  paymentLineId: string | null;
  appointmentId: string | null;
  ruleId: string | null;
  type: string;
  baseAmountCents: number;
  commissionCents: number;
  status: string;
  description: string;
  createdAt: Date;
  employee: { firstName: string; lastName: string };
  adjustments: RawAdj[];
};

const ENTRY_SELECT = {
  id: true, employeeId: true, paymentId: true, paymentLineId: true,
  appointmentId: true, ruleId: true, type: true, baseAmountCents: true,
  commissionCents: true, status: true, description: true, createdAt: true,
  employee:    { select: { firstName: true, lastName: true } },
  adjustments: {
    select: {
      id: true, deltaCents: true, reason: true, createdAt: true,
      adjustedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

function toEntryView(r: RawEntry): CommissionEntryView {
  const adjustments: CommissionAdjustmentView[] = r.adjustments.map((a) => ({
    id:             a.id,
    deltaCents:     a.deltaCents,
    reason:         a.reason,
    adjustedByName: `${a.adjustedBy.firstName} ${a.adjustedBy.lastName}`.trim(),
    createdAt:      a.createdAt,
  }));
  const totalAdjustment = adjustments.reduce((s, a) => s + a.deltaCents, 0);
  return {
    id:                 r.id,
    employeeId:         r.employeeId,
    employeeName:       `${r.employee.firstName} ${r.employee.lastName}`.trim(),
    paymentId:          r.paymentId,
    paymentLineId:      r.paymentLineId,
    appointmentId:      r.appointmentId,
    ruleId:             r.ruleId,
    type:               r.type as CommissionEntryView["type"],
    baseAmountCents:    r.baseAmountCents,
    commissionCents:    r.commissionCents,
    netCommissionCents: r.commissionCents + totalAdjustment,
    status:             r.status as CommissionEntryView["status"],
    description:        r.description,
    createdAt:          r.createdAt,
    adjustments,
  };
}

// ─── Read : toutes les entrées (overview) ─────────────────────────────────────

export async function getCommissionEntries(
  salonId: string,
  organizationId: string,
  opts: { page?: number; employeeId?: string; from?: string; to?: string } = {},
): Promise<CommissionEntriesPage> {
  const page = Math.max(1, opts.page ?? 1);

  const where: Record<string, unknown> = { salonId, organizationId };
  if (opts.employeeId) where["employeeId"] = opts.employeeId;
  if (opts.from ?? opts.to) {
    const range: Record<string, Date> = {};
    if (opts.from) range["gte"] = new Date(`${opts.from}T00:00:00.000Z`);
    if (opts.to)   range["lte"] = new Date(`${opts.to}T23:59:59.999Z`);
    where["createdAt"] = range;
  }

  const [total, rawItems] = await Promise.all([
    prisma.commissionEntry.count({ where: where as never }),
    prisma.commissionEntry.findMany({
      where:   where as never,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      select:  ENTRY_SELECT,
    }),
  ]);

  return {
    entries:  (rawItems as unknown as RawEntry[]).map(toEntryView),
    total,
    page,
    pageSize: PAGE_SIZE,
  };
}

// ─── Read : entrées liées à un paiement ──────────────────────────────────────

export async function getCommissionEntriesForPayment(
  salonId: string,
  organizationId: string,
  paymentId: string,
): Promise<CommissionEntryView[]> {
  const rows = await prisma.commissionEntry.findMany({
    where:   { paymentId, salonId, organizationId },
    orderBy: { createdAt: "asc" },
    select:  ENTRY_SELECT,
  });
  return (rows as unknown as RawEntry[]).map(toEntryView);
}

// ─── Read : commissions d'un employé ─────────────────────────────────────────

export async function getEmployeeCommissions(
  employeeId: string,
  salonId: string,
  organizationId: string,
  opts: { page?: number; from?: string; to?: string } = {},
): Promise<CommissionEntriesPage> {
  return getCommissionEntries(salonId, organizationId, { ...opts, employeeId });
}

// ─── Read : résumé d'un employé ───────────────────────────────────────────────

export async function getEmployeeCommissionSummary(
  employeeId: string,
  salonId: string,
  organizationId: string,
  opts: { from?: string; to?: string } = {},
): Promise<CommissionSummary> {
  const where: Record<string, unknown> = { employeeId, salonId, organizationId };
  if (opts.from ?? opts.to) {
    const range: Record<string, Date> = {};
    if (opts.from) range["gte"] = new Date(`${opts.from}T00:00:00.000Z`);
    if (opts.to)   range["lte"] = new Date(`${opts.to}T23:59:59.999Z`);
    where["createdAt"] = range;
  }

  const entries = await prisma.commissionEntry.findMany({
    where: where as never,
    select: {
      commissionCents: true,
      status:          true,
      adjustments:     { select: { deltaCents: true } },
    },
  });

  let totalBaseCents       = 0;
  let totalAdjustmentCents = 0;
  let pendingCount         = 0;
  let adjustedCount        = 0;
  let cancelledCount       = 0;

  for (const e of entries) {
    const status = e.status as string;
    if (status === "CANCELLED") { cancelledCount++; continue; }
    if (status === "PENDING")   pendingCount++;
    if (status === "ADJUSTED")  adjustedCount++;
    totalBaseCents += e.commissionCents;
    totalAdjustmentCents += e.adjustments.reduce((s, a) => s + a.deltaCents, 0);
  }

  return {
    totalBaseCents,
    totalAdjustmentCents,
    netTotalCents: totalBaseCents + totalAdjustmentCents,
    pendingCount,
    adjustedCount,
    cancelledCount,
  };
}

// ─── Read : vue d'ensemble commissions ───────────────────────────────────────

export async function getCommissionOverview(
  salonId: string,
  organizationId: string,
  opts: { from?: string; to?: string } = {},
): Promise<CommissionOverview> {
  const where: Record<string, unknown> = {
    salonId,
    organizationId,
    status: { not: "CANCELLED" as never },
  };
  if (opts.from ?? opts.to) {
    const range: Record<string, Date> = {};
    if (opts.from) range["gte"] = new Date(`${opts.from}T00:00:00.000Z`);
    if (opts.to)   range["lte"] = new Date(`${opts.to}T23:59:59.999Z`);
    where["createdAt"] = range;
  }

  const entries = await prisma.commissionEntry.findMany({
    where: where as never,
    select: {
      employeeId:      true,
      commissionCents: true,
      adjustments:     { select: { deltaCents: true } },
      employee:        { select: { firstName: true, lastName: true } },
    },
  });

  type EmpAcc = { name: string; baseCents: number; netCents: number; count: number };
  const byEmp = new Map<string, EmpAcc>();
  let totalBaseCents = 0;
  let totalNetCents  = 0;

  for (const e of entries) {
    const adj  = e.adjustments.reduce((s, a) => s + a.deltaCents, 0);
    const net  = e.commissionCents + adj;
    totalBaseCents += e.commissionCents;
    totalNetCents  += net;
    const prev = byEmp.get(e.employeeId) ?? {
      name:      `${e.employee.firstName} ${e.employee.lastName}`.trim(),
      baseCents: 0,
      netCents:  0,
      count:     0,
    };
    byEmp.set(e.employeeId, {
      name:      prev.name,
      baseCents: prev.baseCents + e.commissionCents,
      netCents:  prev.netCents  + net,
      count:     prev.count     + 1,
    });
  }

  const byEmployee = [...byEmp.entries()]
    .map(([employeeId, s]) => ({
      employeeId,
      employeeName: s.name,
      baseCents:    s.baseCents,
      netCents:     s.netCents,
      count:        s.count,
    }))
    .sort((a, b) => b.netCents - a.netCents);

  return { totalBaseCents, totalNetCents, entryCount: entries.length, byEmployee };
}

// ─── Mutation : ajustement manuel ─────────────────────────────────────────────

export async function adjustCommission(
  proUserId: string,
  salonId: string,
  organizationId: string,
  entryId: string,
  deltaCents: number,
  reason: string,
): Promise<void> {
  const entry = await prisma.commissionEntry.findFirst({
    where:  { id: entryId, salonId, organizationId },
    select: { id: true, status: true },
  });
  if (!entry) throw new Error("Entrée de commission introuvable.");
  if ((entry.status as string) === "CANCELLED")
    throw new Error("Impossible d'ajuster une commission annulée.");

  await prisma.$transaction(async (tx) => {
    await tx.commissionAdjustment.create({
      data: {
        entryId,
        adjustedByProUserId: proUserId,
        deltaCents,
        reason,
      },
    });
    await tx.commissionEntry.update({
      where: { id: entryId },
      data:  { status: "ADJUSTED" as never },
    });
  });
}
