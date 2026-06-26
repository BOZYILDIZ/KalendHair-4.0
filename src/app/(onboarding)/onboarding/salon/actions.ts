"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import {
  SalonSetupSchema,
  timeToMinutes,
  DAYS_OF_WEEK,
  type DayKey,
} from "@/lib/schemas/salon-setup.schema";
import type { DayOfWeek } from "@prisma/client";

export type SalonSetupState =
  | null
  | { error?: string; fieldErrors?: Record<string, string[]> };

export async function updateSalonSetupAction(
  _prevState: SalonSetupState,
  formData: FormData,
): Promise<SalonSetupState> {
  // ── 1. Authentification via session tenant ────────────────────────────────
  const session = await requireSession();

  // ── 2. Charger le salon de cette organisation ─────────────────────────────
  const salon = await prisma.salon.findUnique({
    where: { organizationId: session.organizationId },
    select: { id: true },
  });

  if (!salon) {
    return { error: "Salon introuvable. Veuillez contacter le support." };
  }

  // ── 3. Lire les données du formulaire ─────────────────────────────────────
  const schedule: Record<string, unknown> = {};
  for (const day of DAYS_OF_WEEK) {
    const key = day as DayKey;
    schedule[key] = {
      isOpen: formData.get(`${key}_isOpen`) === "on",
      openTime: formData.get(`${key}_openTime`)?.toString() ?? "",
      closeTime: formData.get(`${key}_closeTime`)?.toString() ?? "",
      lunchStart: formData.get(`${key}_lunchStart`)?.toString() ?? "",
      lunchEnd: formData.get(`${key}_lunchEnd`)?.toString() ?? "",
    };
  }

  const raw = {
    salonName: formData.get("salonName"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    timezone: formData.get("timezone"),
    currency: formData.get("currency"),
    language: formData.get("language"),
    schedule,
  };

  // ── 4. Validation Zod ─────────────────────────────────────────────────────
  const parsed = SalonSetupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "_";
      fieldErrors[path] ??= [];
      fieldErrors[path].push(issue.message);
    }
    return { fieldErrors };
  }

  const { salonName, phone, address, city, postalCode, timezone, currency, language, schedule: sched } =
    parsed.data;

  // ── 5. Transaction Prisma ─────────────────────────────────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      // 5a. Mettre à jour les informations du salon
      await tx.salon.update({
        where: { id: salon.id },
        data: {
          name: salonName,
          phone: phone || null,
          address: address || null,
          city,
          postalCode,
          timezone,
          currency,
          language,
        },
      });

      // 5b. Remplacer les horaires (clean slate + createMany)
      await tx.salonSchedule.deleteMany({ where: { salonId: salon.id } });

      const scheduleEntries = DAYS_OF_WEEK.map((day) => {
        const dayData = sched[day as DayKey];
        const isOpen = dayData.isOpen;

        const openTime = isOpen && dayData.openTime ? dayData.openTime : "00:00";
        const closeTime = isOpen && dayData.closeTime ? dayData.closeTime : "00:00";
        const lunchStart = isOpen && dayData.lunchStart ? dayData.lunchStart : null;
        const lunchEnd = isOpen && dayData.lunchEnd ? dayData.lunchEnd : null;

        return {
          salonId: salon.id,
          dayOfWeek: day as DayOfWeek,
          isOpen,
          startMinute: timeToMinutes(openTime),
          endMinute: timeToMinutes(closeTime),
          lunchStartMinute:
            lunchStart && typeof lunchStart === "string" && lunchStart.length > 0
              ? timeToMinutes(lunchStart)
              : null,
          lunchEndMinute:
            lunchEnd && typeof lunchEnd === "string" && lunchEnd.length > 0
              ? timeToMinutes(lunchEnd)
              : null,
        };
      });

      await tx.salonSchedule.createMany({ data: scheduleEntries });
    });
  } catch {
    return { error: "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer." };
  }

  // ── 6. Étape 2 terminée → étape 3 services ───────────────────────────────
  redirect("/onboarding/services");
}
