import { prisma } from "@/lib/db/prisma";
import {
  DAYS_OF_WEEK,
  type EmployeeScheduleGridEntry,
  type SalonScheduleGridEntry,
} from "./types";
import type { EmployeeScheduleDayInput } from "./schedule.schema";

export async function getEmployeeSchedule(
  employeeId: string,
  organizationId: string,
  salonSchedule: SalonScheduleGridEntry[],
): Promise<EmployeeScheduleGridEntry[]> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId },
    select: { id: true },
  });
  if (!employee) return [];

  const rows = await prisma.employeeSchedule.findMany({
    where: { employeeId },
    select: {
      dayOfWeek:   true,
      startMinute: true,
      endMinute:   true,
      isWorking:   true,
    },
  });

  // Build ordered 7-day grid — merge DB data with salon defaults
  return DAYS_OF_WEEK.map((day) => {
    const row = rows.find((r) => r.dayOfWeek === day);
    if (row) {
      return {
        dayOfWeek:   day,
        startMinute: row.startMinute,
        endMinute:   row.endMinute,
        isWorking:   row.isWorking,
      };
    }
    // Default: copy salon schedule for this day
    const salonDay = salonSchedule.find((s) => s.dayOfWeek === day);
    return {
      dayOfWeek:   day,
      startMinute: salonDay?.startMinute ?? 540,
      endMinute:   salonDay?.endMinute   ?? 1080,
      isWorking:   salonDay?.isOpen      ?? false,
    };
  });
}

export type SaveEmployeeScheduleResult =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string> }
  | { ok: false; error: string };

export async function saveEmployeeSchedule(
  employeeId: string,
  organizationId: string,
  salonSchedule: SalonScheduleGridEntry[],
  days: EmployeeScheduleDayInput[],
): Promise<SaveEmployeeScheduleResult> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId },
    select: { id: true },
  });
  if (!employee) return { ok: false, error: "Employé introuvable ou non autorisé" };

  // Cross-validate: employee hours must be within salon hours
  const fieldErrors: Record<string, string> = {};
  for (const day of days) {
    if (!day.isWorking) continue;
    const salonDay = salonSchedule.find((s) => s.dayOfWeek === day.dayOfWeek);
    if (!salonDay || !salonDay.isOpen) {
      fieldErrors[day.dayOfWeek] = "Le salon est fermé ce jour";
      continue;
    }
    if (
      day.startMinute < salonDay.startMinute ||
      day.endMinute > salonDay.endMinute
    ) {
      fieldErrors[day.dayOfWeek] =
        `Hors des horaires du salon (${minutesToTime(salonDay.startMinute)}–${minutesToTime(salonDay.endMinute)})`;
    }
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  await prisma.$transaction([
    prisma.employeeSchedule.deleteMany({ where: { employeeId } }),
    prisma.employeeSchedule.createMany({
      data: days.map((d) => ({
        employeeId,
        dayOfWeek:   d.dayOfWeek,
        startMinute: d.startMinute,
        endMinute:   d.endMinute,
        isWorking:   d.isWorking,
      })),
    }),
  ]);

  return { ok: true };
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
