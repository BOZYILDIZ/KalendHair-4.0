import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { ScheduleSetupForm } from "./components/schedule-setup-form";

export type DayScheduleInit = {
  dayOfWeek: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasLunch: boolean;
  lunchStartTime: string;
  lunchEndTime: string;
};

const ORDERED_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const DEFAULTS: Record<string, DayScheduleInit> = {
  MONDAY:    { dayOfWeek: "MONDAY",    isOpen: true,  openTime: "09:00", closeTime: "18:00", hasLunch: false, lunchStartTime: "12:00", lunchEndTime: "13:00" },
  TUESDAY:   { dayOfWeek: "TUESDAY",   isOpen: true,  openTime: "09:00", closeTime: "18:00", hasLunch: false, lunchStartTime: "12:00", lunchEndTime: "13:00" },
  WEDNESDAY: { dayOfWeek: "WEDNESDAY", isOpen: true,  openTime: "09:00", closeTime: "18:00", hasLunch: false, lunchStartTime: "12:00", lunchEndTime: "13:00" },
  THURSDAY:  { dayOfWeek: "THURSDAY",  isOpen: true,  openTime: "09:00", closeTime: "18:00", hasLunch: false, lunchStartTime: "12:00", lunchEndTime: "13:00" },
  FRIDAY:    { dayOfWeek: "FRIDAY",    isOpen: true,  openTime: "09:00", closeTime: "18:00", hasLunch: false, lunchStartTime: "12:00", lunchEndTime: "13:00" },
  SATURDAY:  { dayOfWeek: "SATURDAY",  isOpen: true,  openTime: "09:00", closeTime: "17:00", hasLunch: false, lunchStartTime: "12:00", lunchEndTime: "13:00" },
  SUNDAY:    { dayOfWeek: "SUNDAY",    isOpen: false, openTime: "09:00", closeTime: "18:00", hasLunch: false, lunchStartTime: "12:00", lunchEndTime: "13:00" },
};

export default async function ScheduleSetupPage() {
  const session = await requireSession();

  const salon = await prisma.salon.findUnique({
    where: { organizationId: session.organizationId },
    select: { id: true },
  });
  if (!salon) redirect("/dashboard");

  const existingSchedules = await prisma.salonSchedule.findMany({
    where: { salonId: salon.id },
    select: {
      dayOfWeek: true,
      isOpen: true,
      startMinute: true,
      endMinute: true,
      lunchStartMinute: true,
      lunchEndMinute: true,
    },
  });

  // Construire une map des horaires existants par jour
  const scheduleMap = new Map(
    existingSchedules.map((s) => [s.dayOfWeek as string, s]),
  );

  // Résoudre les 7 jours dans l'ordre canonique
  const scheduleInits: DayScheduleInit[] = ORDERED_DAYS.map((day) => {
    const existing = scheduleMap.get(day);
    if (existing) {
      return {
        dayOfWeek: day,
        isOpen: existing.isOpen,
        openTime: minutesToTime(existing.startMinute),
        closeTime: minutesToTime(existing.endMinute),
        hasLunch: existing.lunchStartMinute !== null,
        lunchStartTime:
          existing.lunchStartMinute !== null
            ? minutesToTime(existing.lunchStartMinute)
            : "12:00",
        lunchEndTime:
          existing.lunchEndMinute !== null
            ? minutesToTime(existing.lunchEndMinute)
            : "13:00",
      };
    }
    return DEFAULTS[day]!;
  });

  return (
    <div className="w-full max-w-2xl">
      {/* En-tête */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Étape 5 sur 6
        </p>
        <div className="mb-4 flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= 5 ? "bg-indigo-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Horaires d&apos;ouverture
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Définissez les heures d&apos;ouverture de votre salon pour chaque jour
          de la semaine. Ces horaires seront visibles par vos clients lors de la
          prise de rendez-vous.
        </p>
      </div>

      <ScheduleSetupForm scheduleInits={scheduleInits} />
    </div>
  );
}
