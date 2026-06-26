import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { minutesToTime } from "@/lib/schemas/salon-setup.schema";
import { SalonSetupForm } from "./components/salon-setup-form";
import type { DayOfWeek } from "@prisma/client";

export const metadata: Metadata = {
  title: "Configuration du salon — KalendHair",
  robots: { index: false, follow: false },
};

export type ScheduleInit = Record<
  DayOfWeek,
  {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    lunchStart: string;
    lunchEnd: string;
  }
>;

export default async function SalonSetupPage() {
  const session = await requireSession();

  const salon = await prisma.salon.findUnique({
    where: { organizationId: session.organizationId },
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      city: true,
      postalCode: true,
      timezone: true,
      currency: true,
      language: true,
    },
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

  const DAY_DEFAULTS: ScheduleInit = {
    MONDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "", lunchEnd: "" },
    TUESDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "", lunchEnd: "" },
    WEDNESDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "", lunchEnd: "" },
    THURSDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "", lunchEnd: "" },
    FRIDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "", lunchEnd: "" },
    SATURDAY: { isOpen: false, openTime: "09:00", closeTime: "17:00", lunchStart: "", lunchEnd: "" },
    SUNDAY: { isOpen: false, openTime: "09:00", closeTime: "17:00", lunchStart: "", lunchEnd: "" },
  };

  const scheduleInit: ScheduleInit = { ...DAY_DEFAULTS };
  for (const s of existingSchedules) {
    scheduleInit[s.dayOfWeek] = {
      isOpen: s.isOpen,
      openTime: s.isOpen ? minutesToTime(s.startMinute) : DAY_DEFAULTS[s.dayOfWeek].openTime,
      closeTime: s.isOpen ? minutesToTime(s.endMinute) : DAY_DEFAULTS[s.dayOfWeek].closeTime,
      lunchStart: s.lunchStartMinute != null ? minutesToTime(s.lunchStartMinute) : "",
      lunchEnd: s.lunchEndMinute != null ? minutesToTime(s.lunchEndMinute) : "",
    };
  }

  return (
    <div className="w-full max-w-2xl">
      {/* En-tête wizard */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Étape 2 sur 6
        </p>
        {/* Barre de progression */}
        <div className="mb-4 flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= 2 ? "bg-indigo-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Configuration de votre salon</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ces informations sont utilisées pour les réservations et votre page publique.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <SalonSetupForm
          salonData={{
            name: salon.name,
            phone: salon.phone ?? "",
            address: salon.address ?? "",
            city: salon.city ?? "",
            postalCode: salon.postalCode ?? "",
            timezone: salon.timezone,
            currency: salon.currency,
            language: salon.language,
          }}
          scheduleInit={scheduleInit}
        />
      </div>
    </div>
  );
}
