import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/db/prisma";
import { UTC_DAY_MAP } from "@/features/schedules/types";
import type { DayOfWeek } from "@/features/schedules/types";
import {
  SLOT_HEIGHT_REM,
  type GridConfig,
  type AgendaBlock,
  type AgendaColumn,
  type AgendaDayData,
  type AgendaWeekData,
  type AgendaWeekDayData,
  type AgendaEmployeeView,
} from "./types";

// ─── Fallback colors ──────────────────────────────────────────────────────────

const FALLBACK_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

function resolveColor(employee: { id: string; color: string | null }): string {
  if (employee.color) return employee.color;
  let hash = 0;
  for (let i = 0; i < employee.id.length; i++) {
    hash = employee.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]!;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function localDateToUTCMidnight(localDate: string): Date {
  const parts = localDate.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDaysToStr(dateStr: string, days: number): string {
  const dt = localDateToUTCMidnight(dateStr);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().split("T")[0]!;
}

function getWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysToStr(weekStart, i));
}

export function computeWeekStart(dateStr: string): string {
  const dt = localDateToUTCMidnight(dateStr);
  const dow = dt.getUTCDay();
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  dt.setUTCDate(dt.getUTCDate() - daysFromMonday);
  return dt.toISOString().split("T")[0]!;
}

function todayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nowMinuteInTimezone(timezone: string): number {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

// ─── Grid config ──────────────────────────────────────────────────────────────

function computeGridConfig(
  salonSchedules: Array<{ startMinute: number; endMinute: number; isOpen: boolean }>,
  empSchedules: Array<{ isWorking: boolean; startMinute: number; endMinute: number }>,
): GridConfig {
  const workingEmp = empSchedules.filter((s) => s.isWorking);
  const openSalon = salonSchedules.filter((s) => s.isOpen);

  const startCandidates: number[] = [];
  const endCandidates: number[] = [];

  for (const s of openSalon) {
    startCandidates.push(s.startMinute);
    endCandidates.push(s.endMinute);
  }
  for (const s of workingEmp) {
    startCandidates.push(s.startMinute);
    endCandidates.push(s.endMinute);
  }

  const rawStart = startCandidates.length > 0 ? Math.min(...startCandidates) : 480;
  const rawEnd = endCandidates.length > 0 ? Math.max(...endCandidates) : 1200;

  const startMinute = Math.floor(rawStart / 15) * 15;
  const endMinute = Math.ceil(rawEnd / 15) * 15;

  return {
    startMinute,
    endMinute,
    slotCount: Math.max(4, (endMinute - startMinute) / 15),
    slotHeightRem: SLOT_HEIGHT_REM,
  };
}

// ─── Block builder ────────────────────────────────────────────────────────────

const AGENDA_SELECT = {
  id: true,
  startAt: true,
  endAt: true,
  status: true,
  guestFirstName: true,
  guestLastName: true,
  service: { select: { name: true } },
  employee: { select: { id: true, firstName: true, lastName: true, color: true } },
} as const;

type RawAppt = {
  id: string;
  startAt: Date;
  endAt: Date;
  status: string;
  guestFirstName: string | null;
  guestLastName: string | null;
  service: { name: string };
  employee: { id: string; firstName: string; lastName: string; color: string | null };
};

function buildBlock(appt: RawAppt, timezone: string): AgendaBlock {
  const localStart = toZonedTime(appt.startAt, timezone);
  const startMinute = localStart.getHours() * 60 + localStart.getMinutes();
  const durationMinutes = Math.round(
    (appt.endAt.getTime() - appt.startAt.getTime()) / 60_000,
  );
  const first = appt.guestFirstName?.trim() ?? "";
  const last = appt.guestLastName?.trim() ?? "";
  return {
    id: appt.id,
    startMinute,
    endMinute: startMinute + durationMinutes,
    durationMinutes,
    status: appt.status as never,
    clientName: `${first} ${last}`.trim() || "Invité",
    serviceName: appt.service.name,
    employeeId: appt.employee.id,
    employeeFirstName: appt.employee.firstName,
    employeeColor: resolveColor(appt.employee),
  };
}

function localDateForAppt(appt: RawAppt, timezone: string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(appt.startAt);
}

// ─── getAgendaDay ─────────────────────────────────────────────────────────────

export async function getAgendaDay(
  salonId: string,
  organizationId: string,
  localDate: string,
  timezone: string,
  employeeId?: string,
): Promise<AgendaDayData> {
  const localDateAsUTC = localDateToUTCMidnight(localDate);
  const dayIndex = localDateAsUTC.getUTCDay();
  const dayOfWeek = UTC_DAY_MAP[dayIndex] as DayOfWeek;

  const dayStartUTC = fromZonedTime(`${localDate}T00:00:00`, timezone);
  const dayEndUTC = fromZonedTime(`${localDate}T23:59:59`, timezone);

  const [appointments, employees, salonScheduleRows, closedDay, empScheduleRows] =
    await Promise.all([
      prisma.appointment.findMany({
        where: {
          salonId,
          organizationId,
          isActive: true,
          startAt: { gte: dayStartUTC, lt: dayEndUTC },
          ...(employeeId ? { employeeId } : {}),
        },
        select: AGENDA_SELECT,
        orderBy: { startAt: "asc" },
      }),
      prisma.employee.findMany({
        where: { salonId, organizationId, isActive: true },
        select: { id: true, firstName: true, lastName: true, color: true },
        orderBy: { firstName: "asc" },
      }),
      prisma.salonSchedule.findMany({
        where: { salonId, dayOfWeek },
        select: { isOpen: true, startMinute: true, endMinute: true },
      }),
      prisma.closedDay.findFirst({
        where: { salonId, date: localDateAsUTC },
        select: { id: true, reason: true },
      }),
      prisma.employeeSchedule.findMany({
        where: {
          dayOfWeek,
          employee: { salonId, organizationId, isActive: true },
          ...(employeeId ? { employeeId } : {}),
        },
        select: { employeeId: true, isWorking: true, startMinute: true, endMinute: true },
      }),
    ]);

  const isClosed = !!closedDay;
  const salonIsOpen = salonScheduleRows.some((s) => s.isOpen);

  const gridConfig = computeGridConfig(salonScheduleRows, empScheduleRows);

  const empScheduleMap = new Map(empScheduleRows.map((s) => [s.employeeId, s]));

  const blocks = appointments.map((a) => buildBlock(a, timezone));

  const filteredEmployees: AgendaEmployeeView[] = employeeId
    ? employees.filter((e) => e.id === employeeId)
    : employees;

  const columns: AgendaColumn[] = filteredEmployees.map((emp) => {
    const sched = empScheduleMap.get(emp.id);
    return {
      employee: emp,
      appointments: blocks.filter((b) => b.employeeId === emp.id),
      isWorking: sched?.isWorking ?? false,
      scheduleStart: sched?.isWorking ? (sched.startMinute ?? null) : null,
      scheduleEnd: sched?.isWorking ? (sched.endMinute ?? null) : null,
    };
  });

  return {
    date: localDate,
    timezone,
    isClosed,
    closedReason: closedDay?.reason ?? null,
    salonIsOpen,
    gridConfig,
    columns,
    employees,
    todayStr: todayInTimezone(timezone),
    nowMinute: nowMinuteInTimezone(timezone),
  };
}

// ─── getAgendaWeek ────────────────────────────────────────────────────────────

export async function getAgendaWeek(
  salonId: string,
  organizationId: string,
  weekStart: string,
  timezone: string,
  employeeId?: string,
): Promise<AgendaWeekData> {
  const weekEnd = addDaysToStr(weekStart, 6);
  const weekStartUTC = fromZonedTime(`${weekStart}T00:00:00`, timezone);
  const weekEndUTC = fromZonedTime(`${weekEnd}T23:59:59`, timezone);

  const [appointments, employees, salonSchedules, closedDays, empSchedules] =
    await Promise.all([
      prisma.appointment.findMany({
        where: {
          salonId,
          organizationId,
          isActive: true,
          startAt: { gte: weekStartUTC, lte: weekEndUTC },
          ...(employeeId ? { employeeId } : {}),
        },
        select: AGENDA_SELECT,
        orderBy: { startAt: "asc" },
      }),
      prisma.employee.findMany({
        where: { salonId, organizationId, isActive: true },
        select: { id: true, firstName: true, lastName: true, color: true },
        orderBy: { firstName: "asc" },
      }),
      prisma.salonSchedule.findMany({
        where: { salonId },
        select: {
          dayOfWeek: true,
          isOpen: true,
          startMinute: true,
          endMinute: true,
        },
      }),
      prisma.closedDay.findMany({
        where: {
          salonId,
          date: { gte: weekStartUTC, lte: weekEndUTC },
        },
        select: { date: true, reason: true },
      }),
      prisma.employeeSchedule.findMany({
        where: {
          employee: { salonId, organizationId, isActive: true },
          ...(employeeId ? { employeeId } : {}),
        },
        select: {
          employeeId: true,
          dayOfWeek: true,
          isWorking: true,
          startMinute: true,
          endMinute: true,
        },
      }),
    ]);

  const closedDayMap = new Map<string, string | null>(
    closedDays.map((cd) => [
      cd.date.toISOString().split("T")[0]!,
      cd.reason ?? null,
    ]),
  );

  const salonScheduleByDay = new Map(salonSchedules.map((s) => [s.dayOfWeek, s]));

  const gridConfig = computeGridConfig(salonSchedules, empSchedules);

  // Group blocks by local date
  const dateToBlocks = new Map<string, AgendaBlock[]>();
  for (const appt of appointments) {
    const localDate = localDateForAppt(appt, timezone);
    if (!dateToBlocks.has(localDate)) dateToBlocks.set(localDate, []);
    dateToBlocks.get(localDate)!.push(buildBlock(appt, timezone));
  }

  const weekDates = getWeekDates(weekStart);
  const days: AgendaWeekDayData[] = weekDates.map((dateStr) => {
    const dateAsUTC = localDateToUTCMidnight(dateStr);
    const dayIndex = dateAsUTC.getUTCDay();
    const dayOfWeek = UTC_DAY_MAP[dayIndex] as DayOfWeek;
    const closedKey = dateAsUTC.toISOString().split("T")[0]!;
    const isClosed = closedDayMap.has(closedKey);
    const salonSched = salonScheduleByDay.get(dayOfWeek);

    const label = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "UTC",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(dateAsUTC);

    return {
      date: dateStr,
      label,
      isClosed,
      closedReason: closedDayMap.get(closedKey) ?? null,
      salonIsOpen: !!salonSched?.isOpen,
      appointments: dateToBlocks.get(dateStr) ?? [],
    };
  });

  return {
    weekStart,
    weekEnd,
    timezone,
    gridConfig,
    days,
    employees,
    todayStr: todayInTimezone(timezone),
  };
}
