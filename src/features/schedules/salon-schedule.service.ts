import { prisma } from "@/lib/db/prisma";
import {
  DAYS_OF_WEEK,
  DEFAULT_SALON_SCHEDULE,
  type DayOfWeek,
  type SalonScheduleGridEntry,
  type SalonScheduleView,
} from "./types";
import type { SalonScheduleDayInput } from "./schedule.schema";

export async function getSalonSchedule(
  salonId: string,
  organizationId: string,
): Promise<SalonScheduleGridEntry[]> {
  // Verify salon belongs to org
  const salon = await prisma.salon.findFirst({
    where: { id: salonId, organizationId },
    select: { id: true },
  });
  if (!salon) return [...DEFAULT_SALON_SCHEDULE];

  const rows = await prisma.salonSchedule.findMany({
    where: { salonId },
    select: {
      id: true,
      salonId: true,
      dayOfWeek: true,
      startMinute: true,
      endMinute: true,
      isOpen: true,
    },
  });

  // Build ordered 7-day grid — merge DB data with defaults
  return DAYS_OF_WEEK.map((day) => {
    const row = rows.find((r) => r.dayOfWeek === day);
    if (row) {
      return {
        dayOfWeek:   day,
        startMinute: row.startMinute,
        endMinute:   row.endMinute,
        isOpen:      row.isOpen,
      };
    }
    const def = DEFAULT_SALON_SCHEDULE.find((d) => d.dayOfWeek === day);
    return {
      dayOfWeek:   day,
      startMinute: def?.startMinute ?? 540,
      endMinute:   def?.endMinute   ?? 1080,
      isOpen:      def?.isOpen      ?? false,
    };
  });
}

export async function getSalonScheduleRaw(salonId: string): Promise<SalonScheduleView[]> {
  const rows = await prisma.salonSchedule.findMany({
    where: { salonId },
    select: {
      id: true,
      salonId: true,
      dayOfWeek: true,
      startMinute: true,
      endMinute: true,
      isOpen: true,
    },
  });
  return rows.map((r) => ({ ...r, dayOfWeek: r.dayOfWeek as DayOfWeek }));
}

export async function saveSalonSchedule(
  salonId: string,
  organizationId: string,
  days: SalonScheduleDayInput[],
): Promise<void> {
  // Verify salon belongs to org
  const salon = await prisma.salon.findFirst({
    where: { id: salonId, organizationId },
    select: { id: true },
  });
  if (!salon) throw new Error("Salon introuvable ou non autorisé");

  await prisma.$transaction([
    prisma.salonSchedule.deleteMany({ where: { salonId } }),
    prisma.salonSchedule.createMany({
      data: days.map((d) => ({
        salonId,
        dayOfWeek:   d.dayOfWeek,
        startMinute: d.startMinute,
        endMinute:   d.endMinute,
        isOpen:      d.isOpen,
      })),
    }),
  ]);
}
