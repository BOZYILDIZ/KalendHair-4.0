"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FinalisationState = null | { error: string };

// ── Action ────────────────────────────────────────────────────────────────────

export async function completeOnboardingAction(
  _prevState: FinalisationState,
  _formData: FormData,
): Promise<FinalisationState> {
  // ── 1. Authentification ───────────────────────────────────────────────────
  const session = await requireSession();

  // ── 2. Recharger les données serveur (jamais confiance à l'état client) ───
  const salon = await prisma.salon.findUnique({
    where: { organizationId: session.organizationId },
    select: {
      id: true,
      services: {
        where: { isActive: true },
        select: { id: true },
      },
      employees: {
        select: {
          id: true,
          employeeServices: { select: { serviceId: true } },
        },
      },
      salonSchedules: {
        where: { isOpen: true },
        select: { id: true },
      },
    },
  });

  if (!salon) {
    return { error: "Salon introuvable. Veuillez contacter le support." };
  }

  // ── 3. Vérification des préconditions BLOCKING ────────────────────────────
  const errors: string[] = [];

  if (salon.services.length === 0) {
    errors.push("Aucun service actif n'a été créé.");
  }
  if (salon.employees.length === 0) {
    errors.push("Aucun employé n'a été créé.");
  }
  if (salon.salonSchedules.length === 0) {
    errors.push("Les horaires d'ouverture n'ont pas été configurés.");
  }
  const employeeWithoutService = salon.employees.find(
    (e) => e.employeeServices.length === 0,
  );
  if (employeeWithoutService) {
    errors.push("Un ou plusieurs employés n'ont aucun service associé.");
  }

  if (errors.length > 0) {
    return { error: errors.join("\n") };
  }

  // ── 4. Finalisation ───────────────────────────────────────────────────────
  // Décision : pas d'écriture en base. La présence des données (salon +
  // services + employés + horaires) prouve que l'onboarding est terminé.
  // Un champ onboardingCompletedAt pourra être ajouté via migration si un
  // besoin analytique ou de re-onboarding l'exige dans une version ultérieure.
  redirect("/dashboard");
}
