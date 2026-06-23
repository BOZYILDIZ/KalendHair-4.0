import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/db/prisma";
import { UTC_DAY_MAP } from "@/features/schedules/types";
import { minutesToTime } from "@/lib/utils/time";
import { SLOT_INTERVAL_MINUTES } from "./types";

export async function getAvailableSlots(
  salonId: string,
  organizationId: string,
  employeeId: string,
  localDateStr: string,
  durationMinutes: number,
): Promise<number[]> {
  // Verify employee + load salon timezone in parallel
  const [employee, salon] = await Promise.all([
    prisma.employee.findFirst({
      where: { id: employeeId, organizationId, salonId, isActive: true },
      select: { id: true },
    }),
    prisma.salon.findFirst({
      where: { id: salonId, organizationId },
      select: { timezone: true },
    }),
  ]);
  if (!employee || !salon) return [];

  const timezone = salon.timezone ?? "Europe/Paris";

  // Build local date as UTC midnight (for dayOfWeek + ClosedDay lookup)
  const parts = localDateStr.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  const localDateAsUTC = new Date(Date.UTC(y, m - 1, d));

  const dayIndex  = localDateAsUTC.getUTCDay();
  const dayOfWeek = UTC_DAY_MAP[dayIndex];
  if (!dayOfWeek) return [];

  // Check salon schedule + closed day + employee schedule in parallel
  const [salonSchedule, closedDay, empSchedule] = await Promise.all([
    prisma.salonSchedule.findFirst({
      where: { salonId, dayOfWeek },
      select: { isOpen: true },
    }),
    prisma.closedDay.findFirst({
      where: { salonId, date: localDateAsUTC },
      select: { id: true },
    }),
    prisma.employeeSchedule.findFirst({
      where: { employeeId, dayOfWeek },
      select: { isWorking: true, startMinute: true, endMinute: true },
    }),
  ]);

  if (!salonSchedule?.isOpen) return [];
  if (closedDay) return [];
  if (!empSchedule?.isWorking) return [];

  // Get existing non-cancelled appointments for this employee on this local date
  const dayStartUTC = fromZonedTime(`${localDateStr}T00:00:00`, timezone);
  const dayEndUTC   = new Date(dayStartUTC.getTime() + 24 * 60 * 60_000);

  const existingAppts = await prisma.appointment.findMany({
    where: {
      employeeId,
      status:  { not: "CANCELLED" as never },
      startAt: { lt: dayEndUTC },
      endAt:   { gt: dayStartUTC },
    },
    select: { startAt: true, endAt: true },
  });

  // Generate valid slots
  const slots: number[] = [];
  for (
    let slot = empSchedule.startMinute;
    slot + durationMinutes <= empSchedule.endMinute;
    slot += SLOT_INTERVAL_MINUTES
  ) {
    const slotStart = fromZonedTime(`${localDateStr}T${minutesToTime(slot)}:00`, timezone);
    const slotEnd   = new Date(slotStart.getTime() + durationMinutes * 60_000);

    const hasConflict = existingAppts.some(
      (a) => a.startAt < slotEnd && a.endAt > slotStart,
    );
    if (!hasConflict) slots.push(slot);
  }

  return slots;
}
