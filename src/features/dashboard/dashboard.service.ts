import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/db/prisma";
import type {
  Period,
  AppointmentCounts,
  TopServiceRow,
  TopEmployeeRow,
  FillRateResult,
  DashboardKpi,
} from "./types";

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayInTz(timezone: string): string {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: timezone }).format(new Date());
}

function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  return new Date(Date.UTC(y, m - 1, d + days, 12)).toISOString().slice(0, 10);
}

function dayOfWeekIndex(dateStr: string): number {
  const parts = dateStr.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

function buildPeriodRange(period: Period, timezone: string): { start: Date; end: Date } {
  const today = todayInTz(timezone);

  if (period === "today") {
    return {
      start: fromZonedTime(`${today}T00:00:00`, timezone),
      end:   fromZonedTime(`${today}T23:59:59.999`, timezone),
    };
  }

  if (period === "week") {
    const dow = dayOfWeekIndex(today); // 0=Sun … 6=Sat
    const daysToMonday = (dow + 6) % 7;
    const monday = addDays(today, -daysToMonday);
    const sunday = addDays(today, 6 - daysToMonday);
    return {
      start: fromZonedTime(`${monday}T00:00:00`, timezone),
      end:   fromZonedTime(`${sunday}T23:59:59.999`, timezone),
    };
  }

  // month
  const parts    = today.split("-");
  const yearStr  = parts[0] ?? "2026";
  const monthStr = parts[1] ?? "01";
  const year     = parseInt(yearStr, 10);
  const month    = parseInt(monthStr, 10);
  const firstDay = `${yearStr}-${monthStr}-01`;
  const lastDay  = new Date(Date.UTC(year, month, 0, 12)).toISOString().slice(0, 10);
  return {
    start: fromZonedTime(`${firstDay}T00:00:00`, timezone),
    end:   fromZonedTime(`${lastDay}T23:59:59.999`, timezone),
  };
}

function iterateLocalDates(start: Date, end: Date, timezone: string): string[] {
  const formatter = new Intl.DateTimeFormat("fr-CA", { timeZone: timezone });
  const dates: string[] = [];
  const seen   = new Set<string>();
  const cursor = new Date(start.getTime());
  while (cursor < end) {
    const d = formatter.format(cursor);
    if (!seen.has(d)) { seen.add(d); dates.push(d); }
    cursor.setTime(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return dates;
}

// ─── Revenue ──────────────────────────────────────────────────────────────────

async function fetchRevenue(
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

// ─── Appointment counts ───────────────────────────────────────────────────────

async function fetchAppointmentCounts(
  salonId: string,
  organizationId: string,
  start: Date,
  end: Date,
): Promise<AppointmentCounts> {
  const groups = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { status: true },
    where: {
      salonId, organizationId, isActive: true,
      startAt: { gte: start, lt: end },
    },
  });
  const get = (s: string): number =>
    groups.find((g) => (g.status as string) === s)?._count.status ?? 0;
  const completed = get("COMPLETED");
  const confirmed = get("CONFIRMED");
  const pending   = get("PENDING");
  const cancelled = get("CANCELLED");
  const noShow    = get("NO_SHOW");
  return {
    total: completed + confirmed + pending + cancelled + noShow,
    completed, confirmed, pending, cancelled, noShow,
  };
}

// ─── Clients ──────────────────────────────────────────────────────────────────

async function fetchNewClients(salonId: string, start: Date, end: Date): Promise<number> {
  return prisma.salonClient.count({
    where: { salonId, createdAt: { gte: start, lt: end } },
  });
}

async function fetchRecurringClients(
  salonId: string,
  organizationId: string,
): Promise<number> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const rows = await prisma.appointment.groupBy({
    by: ["clientId"],
    _count: { clientId: true },
    where: {
      salonId, organizationId, isActive: true,
      status: "COMPLETED" as never,
      clientId: { not: null },
      startAt: { gte: twelveMonthsAgo },
    },
  });
  return rows.filter((r) => r._count.clientId >= 2).length;
}

// ─── Top services ─────────────────────────────────────────────────────────────

async function fetchTopServices(
  salonId: string,
  organizationId: string,
  start: Date,
  end: Date,
): Promise<TopServiceRow[]> {
  const rows = await prisma.appointment.findMany({
    where: {
      salonId, organizationId, isActive: true,
      status: "COMPLETED" as never,
      startAt: { gte: start, lt: end },
    },
    select: {
      serviceId: true,
      priceCentsSnapshot: true,
      service: { select: { name: true, priceCents: true } },
    },
  });

  type SvcAcc = { name: string; count: number; revenue: number };
  const byService = new Map<string, SvcAcc>();
  for (const r of rows) {
    const rev  = r.priceCentsSnapshot ?? r.service.priceCents;
    const prev = byService.get(r.serviceId) ?? { name: r.service.name, count: 0, revenue: 0 };
    byService.set(r.serviceId, { name: prev.name, count: prev.count + 1, revenue: prev.revenue + rev });
  }

  type SvcStat = { serviceId: string; name: string; count: number; revenue: number };
  const stats: SvcStat[] = [];
  for (const [serviceId, s] of byService.entries()) {
    stats.push({ serviceId, name: s.name, count: s.count, revenue: s.revenue });
  }
  stats.sort((a, b) => b.count - a.count);

  return stats.slice(0, 5).map((s) => ({
    serviceId: s.serviceId,
    serviceName: s.name,
    count: s.count,
    revenueCents: s.revenue,
  }));
}

// ─── Top employees ────────────────────────────────────────────────────────────

async function fetchTopEmployees(
  salonId: string,
  organizationId: string,
  start: Date,
  end: Date,
): Promise<TopEmployeeRow[]> {
  const rows = await prisma.appointment.findMany({
    where: {
      salonId, organizationId, isActive: true,
      status: "COMPLETED" as never,
      startAt: { gte: start, lt: end },
    },
    select: {
      employeeId: true,
      priceCentsSnapshot: true,
      service: { select: { priceCents: true } },
    },
  });

  if (rows.length === 0) return [];

  type EmpAcc = { count: number; revenue: number };
  const byEmployee = new Map<string, EmpAcc>();
  let totalRevenue = 0;

  for (const r of rows) {
    const rev  = r.priceCentsSnapshot ?? r.service.priceCents;
    totalRevenue += rev;
    const prev = byEmployee.get(r.employeeId) ?? { count: 0, revenue: 0 };
    byEmployee.set(r.employeeId, { count: prev.count + 1, revenue: prev.revenue + rev });
  }

  type EmpStat = { employeeId: string; count: number; revenue: number };
  const stats: EmpStat[] = [];
  for (const [employeeId, s] of byEmployee.entries()) {
    stats.push({ employeeId, count: s.count, revenue: s.revenue });
  }
  stats.sort((a, b) => b.count - a.count);
  const top5 = stats.slice(0, 5);

  const employeeIds = top5.map((s) => s.employeeId);
  const employees   = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, firstName: true, lastName: true, color: true },
  });
  const empMap = new Map(employees.map((e) => [e.id, e]));

  return top5.map((s) => {
    const emp = empMap.get(s.employeeId);
    return {
      employeeId:           s.employeeId,
      firstName:            emp?.firstName ?? "—",
      lastName:             emp?.lastName  ?? "",
      color:                emp?.color     ?? null,
      count:                s.count,
      revenueCents:         s.revenue,
      revenueSharePercent:  totalRevenue > 0
        ? Math.round((s.revenue / totalRevenue) * 100)
        : 0,
    };
  });
}

// ─── Fill rate ────────────────────────────────────────────────────────────────

const JS_DOW_TO_PRISMA: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

async function fetchFillRate(
  salonId: string,
  start: Date,
  end: Date,
  timezone: string,
): Promise<FillRateResult> {
  const employees = await prisma.employee.findMany({
    where: { salonId, isActive: true },
    select: { id: true },
  });

  if (employees.length === 0) {
    return { bookedMinutes: 0, availableMinutes: 0, ratePercent: null };
  }

  const localDates = iterateLocalDates(start, end, timezone);
  if (localDates.length === 0) {
    return { bookedMinutes: 0, availableMinutes: 0, ratePercent: null };
  }

  const firstDate = localDates[0] ?? "";
  const lastDate  = localDates[localDates.length - 1] ?? "";
  const employeeIds = employees.map((e) => e.id);

  const [empSchedules, salonSchedules, closedDays, appointments] = await Promise.all([
    prisma.employeeSchedule.findMany({
      where: { employeeId: { in: employeeIds } },
      select: { employeeId: true, dayOfWeek: true, startMinute: true, endMinute: true, isWorking: true },
    }),
    prisma.salonSchedule.findMany({
      where: { salonId },
      select: { dayOfWeek: true, isOpen: true },
    }),
    prisma.closedDay.findMany({
      where: {
        salonId,
        date: {
          gte: new Date(`${firstDate}T00:00:00.000Z`),
          lte: new Date(`${lastDate}T23:59:59.999Z`),
        },
      },
      select: { date: true },
    }),
    prisma.appointment.findMany({
      where: {
        salonId, isActive: true,
        status: { not: "CANCELLED" as never },
        startAt: { gte: start, lt: end },
      },
      select: { startAt: true, endAt: true },
    }),
  ]);

  // Salon open per day of week (any isOpen=true entry wins)
  const salonOpenMap = new Map<string, boolean>();
  for (const s of salonSchedules) {
    if (!salonOpenMap.has(s.dayOfWeek) || s.isOpen) {
      salonOpenMap.set(s.dayOfWeek, s.isOpen);
    }
  }

  // Closed day set (stored dates as UTC midnight → YYYY-MM-DD string)
  const closedDaySet = new Set(closedDays.map((c) => c.date.toISOString().slice(0, 10)));

  // Employee available minutes per (employeeId, dayOfWeek) key
  const empDayMinutes = new Map<string, number>();
  for (const s of empSchedules) {
    if (!s.isWorking) continue;
    const key = `${s.employeeId}__${s.dayOfWeek}`;
    empDayMinutes.set(key, (empDayMinutes.get(key) ?? 0) + (s.endMinute - s.startMinute));
  }

  // Sum available minutes across all days and employees
  let availableMinutes = 0;
  for (const dateStr of localDates) {
    if (closedDaySet.has(dateStr)) continue;
    const parts = dateStr.split("-");
    const y = parseInt(parts[0] ?? "2000", 10);
    const m = parseInt(parts[1] ?? "1", 10);
    const d = parseInt(parts[2] ?? "1", 10);
    const dow = JS_DOW_TO_PRISMA[new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()] ?? "MONDAY";
    if (!(salonOpenMap.get(dow) ?? false)) continue;

    for (const emp of employees) {
      availableMinutes += empDayMinutes.get(`${emp.id}__${dow}`) ?? 0;
    }
  }

  // Booked minutes from non-cancelled appointments
  const bookedMinutes = Math.round(
    appointments.reduce(
      (acc, a) => acc + (a.endAt.getTime() - a.startAt.getTime()) / 60_000,
      0,
    ),
  );

  if (availableMinutes === 0) {
    return { bookedMinutes, availableMinutes: 0, ratePercent: null };
  }

  return {
    bookedMinutes,
    availableMinutes,
    ratePercent: Math.min(100, Math.round((bookedMinutes / availableMinutes) * 100)),
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getDashboardKpi(
  salonId: string,
  organizationId: string,
  period: Period,
  timezone: string,
): Promise<DashboardKpi> {
  const { start, end } = buildPeriodRange(period, timezone);

  const [revenueCents, counts, newClients, recurringClients, topServices, topEmployees, fillRate] =
    await Promise.all([
      fetchRevenue(salonId, organizationId, start, end),
      fetchAppointmentCounts(salonId, organizationId, start, end),
      fetchNewClients(salonId, start, end),
      fetchRecurringClients(salonId, organizationId),
      fetchTopServices(salonId, organizationId, start, end),
      fetchTopEmployees(salonId, organizationId, start, end),
      fetchFillRate(salonId, start, end, timezone),
    ]);

  return { period, revenueCents, counts, newClients, recurringClients, topServices, topEmployees, fillRate };
}
