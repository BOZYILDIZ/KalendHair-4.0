import { prisma } from "@/lib/db/prisma";
import { UTC_DAY_MAP, type AvailabilityResult } from "./types";

export async function isEmployeeAvailable(
  employeeId: string,
  organizationId: string,
  date: Date,
  startMinute: number,
  durationMinutes: number,
  options?: {
    excludeAppointmentId?: string;
    startAtUTC?: Date;
  },
): Promise<AvailabilityResult> {
  // Step 1 — Load employee, verify tenant
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId },
    select: { id: true, isActive: true, salonId: true },
  });
  if (!employee) return { available: false, reason: "Employé introuvable" };

  // Step 2 — Employee must be active (adjustment 3)
  if (!employee.isActive) return { available: false, reason: "Employé inactif" };

  // Step 3 — Resolve dayOfWeek from UTC date
  const dayIndex = date.getUTCDay();
  const dayOfWeek = UTC_DAY_MAP[dayIndex];
  if (!dayOfWeek) return { available: false, reason: "Date invalide" };

  // Step 4 — Check salon schedule
  const salonSchedule = await prisma.salonSchedule.findFirst({
    where: { salonId: employee.salonId, dayOfWeek },
    select: { isOpen: true, startMinute: true, endMinute: true },
  });
  if (!salonSchedule || !salonSchedule.isOpen) {
    return { available: false, reason: "Salon fermé ce jour" };
  }

  // Step 5 — Check closed day
  const dateStr = date.toISOString().split("T")[0] ?? "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const normalizedDate = new Date(Date.UTC(y ?? 2000, (m ?? 1) - 1, d ?? 1));

  const closedDay = await prisma.closedDay.findFirst({
    where: { salonId: employee.salonId, date: normalizedDate },
    select: { id: true },
  });
  if (closedDay) return { available: false, reason: "Jour de fermeture exceptionnel" };

  // Step 6 — Check employee schedule
  const empSchedule = await prisma.employeeSchedule.findFirst({
    where: { employeeId, dayOfWeek },
    select: { isWorking: true, startMinute: true, endMinute: true },
  });
  if (!empSchedule || !empSchedule.isWorking) {
    return { available: false, reason: "Employé ne travaille pas ce jour" };
  }

  // Step 7 — Check time range
  const endMinute = startMinute + durationMinutes;
  if (
    startMinute < empSchedule.startMinute ||
    endMinute > empSchedule.endMinute
  ) {
    return { available: false, reason: "Hors des horaires de l'employé" };
  }

  // Step 8 — Appointment conflicts (Sprint 8)
  // startAtUTC: actual UTC start (required for correct conflict check in non-UTC timezones)
  const conflictStart = options?.startAtUTC ?? new Date(date.getTime() + startMinute * 60_000);
  const conflictEnd   = new Date(conflictStart.getTime() + durationMinutes * 60_000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      employeeId,
      status:  { not: "CANCELLED" as never },
      startAt: { lt: conflictEnd },
      endAt:   { gt: conflictStart },
      ...(options?.excludeAppointmentId ? { id: { not: options.excludeAppointmentId } } : {}),
    },
    select: { id: true },
  });
  if (conflict) return { available: false, reason: "Créneau déjà réservé" };

  return { available: true };
}
