"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import {
  ScheduleSetupPayloadSchema,
  type ScheduleSetupState,
} from "@/lib/schemas/schedule-setup.schema";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

function formatZodErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>,
): string {
  return issues
    .map((issue) => {
      const root = issue.path[0];
      const idx = issue.path[1];
      const field = issue.path[2];
      if (root === "days" && typeof idx === "number") {
        const order = [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ];
        const dayLabel = DAY_LABELS[order[idx] ?? ""] ?? `Jour ${idx + 1}`;
        const fieldLabel = typeof field === "string" ? ` — ${field}` : "";
        return `${dayLabel}${fieldLabel} : ${issue.message}`;
      }
      return issue.message;
    })
    .join("\n");
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export async function updateScheduleSetupAction(
  _prevState: ScheduleSetupState,
  formData: FormData,
): Promise<ScheduleSetupState> {
  // ── 1. Authentification ───────────────────────────────────────────────────
  const session = await requireSession();

  // ── 2. Lire et parser le payload JSON ────────────────────────────────────
  const payloadStr = formData.get("payload")?.toString();
  if (!payloadStr) {
    return { error: "Données manquantes. Veuillez réessayer." };
  }

  let rawData: unknown;
  try {
    rawData = JSON.parse(payloadStr);
  } catch {
    return { error: "Format de données invalide. Veuillez réessayer." };
  }

  // ── 3. Validation Zod ─────────────────────────────────────────────────────
  const parsed = ScheduleSetupPayloadSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: formatZodErrors(parsed.error.issues) };
  }

  const { days } = parsed.data;

  // ── 4. Transaction Prisma ─────────────────────────────────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      // 4a. Charger le salon via organizationId (@@unique — sécurité multi-tenant)
      const salon = await tx.salon.findUnique({
        where: { organizationId: session.organizationId },
        select: { id: true },
      });
      if (!salon) throw new Error("SALON_NOT_FOUND");

      // 4b. Clean slate — supprimer les horaires existants du salon
      await tx.salonSchedule.deleteMany({ where: { salonId: salon.id } });

      // 4c. Créer les 7 entrées (une par jour, fermé ou ouvert)
      await tx.salonSchedule.createMany({
        data: days.map((day) => ({
          salonId: salon.id,
          dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          startMinute: day.isOpen ? timeToMinutes(day.openTime) : 0,
          endMinute: day.isOpen ? timeToMinutes(day.closeTime) : 0,
          lunchStartMinute:
            day.isOpen && day.hasLunch
              ? timeToMinutes(day.lunchStartTime)
              : null,
          lunchEndMinute:
            day.isOpen && day.hasLunch
              ? timeToMinutes(day.lunchEndTime)
              : null,
        })),
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "SALON_NOT_FOUND") {
      return { error: "Salon introuvable. Veuillez contacter le support." };
    }
    return {
      error:
        "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.",
    };
  }

  // ── 5. Étape 5 terminée → étape 6 finalisation ───────────────────────────
  redirect("/onboarding/finalisation");
}
