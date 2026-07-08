import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/db/prisma";
import { getSalon } from "@/features/salons/salon.service";
import type { SessionUser } from "@/features/auth/types";
import type {
  DashboardOverview,
  DashboardKpiSummary,
  DashboardTrend,
  DashboardAppointmentPreview,
  DashboardAgendaEmployee,
  DashboardAlert,
  DashboardPermissions,
  TrendResult,
  DashboardAlertSubscriptionStatus,
} from "./overview.types";

// ─── Date helpers ─────────────────────────────────────────────────────────────

function nowDateStr(timezone: string): string {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: timezone }).format(new Date());
}

function subtractDay(dateStr: string): string {
  const parts = dateStr.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  return new Date(Date.UTC(y, m - 1, d - 1, 12)).toISOString().slice(0, 10);
}

function toZonedRange(dateStr: string, timezone: string): { start: Date; end: Date } {
  return {
    start: fromZonedTime(`${dateStr}T00:00:00`, timezone),
    end:   fromZonedTime(`${dateStr}T23:59:59.999`, timezone),
  };
}

const DOW_MAP: Record<number, string> = {
  0: "SUNDAY",  1: "MONDAY",  2: "TUESDAY", 3: "WEDNESDAY",
  4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
};

function parseDayOfWeek(dateStr: string): string {
  const parts = dateStr.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  return DOW_MAP[new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()] ?? "MONDAY";
}

function computeTrend(current: number, previous: number): TrendResult {
  if (current === 0 && previous === 0) return { kind: "first_day" };
  if (previous === 0) return { kind: "new" };
  return { kind: "percent", value: Math.round(((current - previous) / previous) * 100) };
}

// ─── Revenue ──────────────────────────────────────────────────────────────────

async function fetchDayRevenue(
  salonId: string,
  organizationId: string,
  start: Date,
  end: Date,
): Promise<number> {
  const rows = await prisma.appointment.findMany({
    where: {
      salonId, organizationId, isActive: true,
      status: "COMPLETED" as never,
      startAt: { gte: start, lt: end },
    },
    select: {
      priceCentsSnapshot: true,
      service: { select: { priceCents: true } },
    },
  });
  return rows.reduce((acc, r) => acc + (r.priceCentsSnapshot ?? r.service.priceCents), 0);
}

// ─── Comptage rendez-vous actifs (CANCELLED + NO_SHOW exclus) ────────────────

type ActiveCounts = {
  total:     number;
  confirmed: number;
  pending:   number;
  completed: number;
};

async function fetchDayActiveCounts(
  salonId: string,
  organizationId: string,
  start: Date,
  end: Date,
  employeeId?: string,
): Promise<ActiveCounts> {
  const groups = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { status: true },
    where: {
      salonId, organizationId, isActive: true,
      status: { notIn: ["CANCELLED", "NO_SHOW"] as never[] },
      startAt: { gte: start, lt: end },
      ...(employeeId ? { employeeId } : {}),
    },
  });
  const get = (s: string): number =>
    groups.find((g) => (g.status as string) === s)?._count.status ?? 0;
  const completed = get("COMPLETED");
  const confirmed = get("CONFIRMED");
  const pending   = get("PENDING");
  return { total: completed + confirmed + pending, confirmed, pending, completed };
}

// ─── Taux de remplissage (aujourd'hui uniquement) ─────────────────────────────

async function fetchDayFillRate(
  salonId: string,
  dateStr: string,
  start: Date,
  end: Date,
): Promise<number | null> {
  const dow = parseDayOfWeek(dateStr);

  const [salonSchedule, closedDay, employees, appointments] = await Promise.all([
    prisma.salonSchedule.findFirst({
      where: { salonId, dayOfWeek: dow as never },
      select: { isOpen: true },
    }),
    // closedDay.date est stocké en UTC midnight — on cible la date locale
    prisma.closedDay.findFirst({
      where: {
        salonId,
        date: {
          gte: new Date(`${dateStr}T00:00:00.000Z`),
          lte: new Date(`${dateStr}T23:59:59.999Z`),
        },
      },
      select: { id: true },
    }),
    prisma.employee.findMany({
      where: { salonId, isActive: true },
      select: {
        id: true,
        employeeSchedules: {
          where: { dayOfWeek: dow as never },
          select: { startMinute: true, endMinute: true, isWorking: true },
        },
      },
    }),
    prisma.appointment.findMany({
      where: {
        salonId, isActive: true,
        status: { notIn: ["CANCELLED", "NO_SHOW"] as never[] },
        startAt: { gte: start, lt: end },
      },
      select: { startAt: true, endAt: true },
    }),
  ]);

  if (closedDay || salonSchedule?.isOpen === false) return null;

  let availableMinutes = 0;
  for (const emp of employees) {
    const s = emp.employeeSchedules[0];
    if (s?.isWorking) availableMinutes += s.endMinute - s.startMinute;
  }
  if (availableMinutes === 0) return null;

  const bookedMinutes = Math.round(
    appointments.reduce(
      (acc, a) => acc + (a.endAt.getTime() - a.startAt.getTime()) / 60_000,
      0,
    ),
  );
  return Math.min(100, Math.round((bookedMinutes / availableMinutes) * 100));
}

// ─── Nouveaux clients ─────────────────────────────────────────────────────────

async function fetchDayNewClients(salonId: string, start: Date, end: Date): Promise<number> {
  return prisma.salonClient.count({ where: { salonId, createdAt: { gte: start, lt: end } } });
}

// ─── Prochains rendez-vous ────────────────────────────────────────────────────

async function fetchUpcomingAppts(
  salonId: string,
  organizationId: string,
  todayStart: Date,
  todayEnd: Date,
  canViewRevenue: boolean,
  employeeId?: string,
): Promise<DashboardAppointmentPreview[]> {
  // "Prochains" = à partir de maintenant (ou début de journée si passé)
  const effectiveStart = new Date() > todayStart ? new Date() : todayStart;

  const rows = await prisma.appointment.findMany({
    where: {
      salonId, organizationId, isActive: true,
      status: { notIn: ["CANCELLED", "NO_SHOW"] as never[] },
      startAt: { gte: effectiveStart, lt: todayEnd },
      ...(employeeId ? { employeeId } : {}),
    },
    orderBy: { startAt: "asc" },
    take: 20,
    select: {
      id:                 true,
      startAt:            true,
      endAt:              true,
      status:             true,
      priceCentsSnapshot: true,
      guestFirstName:     true,
      guestLastName:      true,
      clientId:           true,
      employeeId:         true,
      employee: { select: { firstName: true, lastName: true, color: true } },
      service:  { select: { name: true, color: true, priceCents: true } },
      client:   { select: { firstName: true, lastName: true } },
    },
  });

  return rows.map((a) => {
    let clientName: string;
    if (a.client) {
      clientName = `${a.client.firstName} ${a.client.lastName}`.trim();
    } else if (a.guestFirstName ?? a.guestLastName) {
      clientName = `${a.guestFirstName ?? ""} ${a.guestLastName ?? ""}`.trim();
    } else {
      clientName = "Invité";
    }

    return {
      id:              a.id,
      startAt:         a.startAt,
      endAt:           a.endAt,
      durationMinutes: Math.round((a.endAt.getTime() - a.startAt.getTime()) / 60_000),
      clientName,
      isGuest:         a.clientId === null,
      serviceName:     a.service.name,
      serviceColor:    a.service.color,
      employeeId:      a.employeeId,
      employeeName:    `${a.employee.firstName} ${a.employee.lastName}`.trim(),
      employeeColor:   a.employee.color,
      status:          a.status as "PENDING" | "CONFIRMED" | "COMPLETED",
      priceCents:      canViewRevenue
        ? (a.priceCentsSnapshot ?? a.service.priceCents)
        : null,
    };
  });
}

// ─── Agenda simplifié ─────────────────────────────────────────────────────────

async function fetchAgendaEmployees(
  salonId: string,
  dateStr: string,
  todayStart: Date,
  todayEnd: Date,
  employeeId?: string,
): Promise<DashboardAgendaEmployee[]> {
  const dow = parseDayOfWeek(dateStr);

  const employees = await prisma.employee.findMany({
    where: {
      salonId, isActive: true,
      ...(employeeId ? { id: employeeId } : {}),
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      color:     true,
      employeeSchedules: {
        where: { dayOfWeek: dow as never },
        select: { startMinute: true, endMinute: true, isWorking: true },
      },
      appointments: {
        where: {
          isActive: true,
          status: { notIn: ["CANCELLED", "NO_SHOW"] as never[] },
          startAt: { gte: todayStart, lt: todayEnd },
        },
        select: { id: true },
      },
    },
  });

  return employees.map((emp) => {
    const sched = emp.employeeSchedules[0];
    return {
      employeeId:       emp.id,
      firstName:        emp.firstName,
      lastName:         emp.lastName,
      color:            emp.color,
      workStartMinute:  sched?.isWorking ? sched.startMinute : null,
      workEndMinute:    sched?.isWorking ? sched.endMinute   : null,
      isWorkingToday:   sched?.isWorking ?? false,
      appointmentCount: emp.appointments.length,
    };
  });
}

// ─── Alertes stock ────────────────────────────────────────────────────────────

async function fetchLowStockCount(salonId: string): Promise<number> {
  // Prisma n'accepte pas les comparaisons inter-colonnes en where natif.
  // On charge les stocks (< 100 produits en pratique) et on filtre en mémoire.
  const stocks = await prisma.productStock.findMany({
    where: { salonId },
    select: {
      quantity: true,
      product: { select: { isActive: true, lowStockThreshold: true } },
    },
  });
  return stocks.filter(
    (s) => s.product.isActive && s.quantity <= s.product.lowStockThreshold,
  ).length;
}

// ─── Abonnement ───────────────────────────────────────────────────────────────

async function fetchSubscriptionStatus(organizationId: string): Promise<{
  status:    DashboardAlertSubscriptionStatus;
  expiresAt: Date | null;
}> {
  const sub = await prisma.organizationSubscription.findUnique({
    where: { organizationId },
    select: { status: true, currentPeriodEnd: true, trialEndsAt: true },
  });
  if (!sub) return { status: "unknown", expiresAt: null };

  const expiresAt =
    (sub.status as string) === "TRIAL"
      ? (sub.trialEndsAt ?? sub.currentPeriodEnd)
      : sub.currentPeriodEnd;

  return {
    status:    sub.status as DashboardAlertSubscriptionStatus,
    expiresAt,
  };
}

// ─── Point d'entrée principal ─────────────────────────────────────────────────

/**
 * Retourne une vue consolidée du dashboard pour l'utilisateur connecté.
 *
 * Règles métier appliquées :
 * - CANCELLED et NO_SHOW exclus de tous les KPI et comptages
 * - OWNER / MANAGER : accès au CA, à tous les employés
 * - EMPLOYEE : uniquement ses propres RDV, aucun accès au CA
 * - Tendances : jamais +∞% — retourne "new" ou "first_day" si baseline = 0
 *
 * Pas de cache dans cette PR (unstable_cache → PR-09).
 */
export async function getDashboardOverview(session: SessionUser): Promise<DashboardOverview> {
  // Phase 1 — Résolution des entités de base (parallel)
  const [salon, organization, employeeRecord] = await Promise.all([
    getSalon(session.organizationId),
    prisma.organization.findUnique({
      where:  { id: session.organizationId },
      select: { name: true },
    }),
    session.role === "EMPLOYEE"
      ? prisma.employee.findFirst({
          where: {
            organizationId: session.organizationId,
            proUserId:      session.id,
            isActive:       true,
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (!salon) {
    throw new Error(`Salon introuvable pour l'organisation ${session.organizationId}`);
  }

  const { timezone } = salon;
  const canViewRevenue      = session.role === "OWNER" || session.role === "MANAGER";
  const canViewAllEmployees = session.role !== "EMPLOYEE";
  const empId: string | null = employeeRecord?.id ?? null;

  // Phase 2 — Plages de dates dans le timezone du salon
  const today          = nowDateStr(timezone);
  const yesterday      = subtractDay(today);
  const todayRange     = toZonedRange(today, timezone);
  const yesterdayRange = toZonedRange(yesterday, timezone);

  // Phase 3 — Toutes les requêtes données en parallèle
  const [
    todayCounts,
    todayRevCents,
    yesterdayCounts,
    yesterdayRevCents,
    fillRatePercent,
    newClientsToday,
    upcomingAppointments,
    agendaEmployees,
    lowStockCount,
    subscriptionInfo,
  ] = await Promise.all([
    fetchDayActiveCounts(salon.id, session.organizationId, todayRange.start, todayRange.end, empId ?? undefined),
    canViewRevenue
      ? fetchDayRevenue(salon.id, session.organizationId, todayRange.start, todayRange.end)
      : Promise.resolve(null as number | null),
    fetchDayActiveCounts(salon.id, session.organizationId, yesterdayRange.start, yesterdayRange.end, empId ?? undefined),
    canViewRevenue
      ? fetchDayRevenue(salon.id, session.organizationId, yesterdayRange.start, yesterdayRange.end)
      : Promise.resolve(null as number | null),
    fetchDayFillRate(salon.id, today, todayRange.start, todayRange.end),
    fetchDayNewClients(salon.id, todayRange.start, todayRange.end),
    fetchUpcomingAppts(salon.id, session.organizationId, todayRange.start, todayRange.end, canViewRevenue, empId ?? undefined),
    fetchAgendaEmployees(salon.id, today, todayRange.start, todayRange.end, empId ?? undefined),
    fetchLowStockCount(salon.id),
    fetchSubscriptionStatus(session.organizationId),
  ]);

  // ─── Assemblage ───────────────────────────────────────────────────────────

  const kpi: DashboardKpiSummary = {
    appointmentsTotal: todayCounts.total,
    confirmedCount:    todayCounts.confirmed,
    pendingCount:      todayCounts.pending,
    completedCount:    todayCounts.completed,
    fillRatePercent,
    newClientsToday,
    revenueCents:      canViewRevenue ? (todayRevCents ?? 0) : null,
  };

  const trend: DashboardTrend = {
    revenue: canViewRevenue
      ? computeTrend(todayRevCents ?? 0, yesterdayRevCents ?? 0)
      : null,
    appointments: computeTrend(todayCounts.total, yesterdayCounts.total),
  };

  const alerts: DashboardAlert = {
    pendingAppointmentsCount: todayCounts.pending,
    lowStockProductsCount:    lowStockCount,
    subscriptionStatus:       subscriptionInfo.status,
    subscriptionExpiresAt:    subscriptionInfo.expiresAt,
  };

  const permissions: DashboardPermissions = {
    canViewRevenue,
    canViewAllEmployees,
    employeeId: empId,
  };

  return {
    organizationName: organization?.name ?? "—",
    salonName:        salon.name,
    salonSlug:        salon.slug,
    timezone,
    currentDate:      today,
    kpi,
    trend,
    upcomingAppointments,
    agendaEmployees,
    alerts,
    permissions,
  };
}
