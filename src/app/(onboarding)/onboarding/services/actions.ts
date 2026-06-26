"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import {
  ServicesSetupPayloadSchema,
  type ServicesSetupState,
} from "@/lib/schemas/services-setup.schema";

function formatZodErrors(issues: Array<{ path: PropertyKey[]; message: string }>): string {
  return issues
    .map((issue) => {
      const root = issue.path[0];
      const idx = issue.path[1];
      const field = issue.path[2];
      if (root === "services" && typeof idx === "number") {
        return `Service ${idx + 1} — ${typeof field === "string" ? field : ""}: ${issue.message}`;
      }
      if (root === "categories" && typeof idx === "number") {
        return `Catégorie ${idx + 1}: ${issue.message}`;
      }
      return issue.message;
    })
    .join("\n");
}

export async function updateServicesSetupAction(
  _prevState: ServicesSetupState,
  formData: FormData,
): Promise<ServicesSetupState> {
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
  const parsed = ServicesSetupPayloadSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: formatZodErrors(parsed.error.issues) };
  }

  const { categories, services } = parsed.data;

  // ── 4. Transaction Prisma ─────────────────────────────────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      // 4a. Charger le salon via organizationId (@@unique — sécurité multi-tenant)
      const salon = await tx.salon.findUnique({
        where: { organizationId: session.organizationId },
        select: { id: true },
      });
      if (!salon) throw new Error("SALON_NOT_FOUND");

      // 4b. Vérifier qu'il n'existe pas de rendez-vous (sécurité onDelete: Restrict)
      const hasAppointments = await tx.appointment.findFirst({
        where: { salonId: salon.id },
        select: { id: true },
      });
      if (hasAppointments) throw new Error("APPOINTMENTS_EXIST");

      // 4c. Supprimer les services et catégories existants (clean slate)
      await tx.service.deleteMany({ where: { salonId: salon.id } });
      await tx.serviceCategory.deleteMany({ where: { salonId: salon.id } });

      // 4d. Créer les catégories et constituer la table clé → id DB
      const categoryIdMap = new Map<string, string>();
      for (const cat of categories) {
        const created = await tx.serviceCategory.create({
          data: {
            organizationId: session.organizationId,
            salonId: salon.id,
            name: cat.name,
          },
          select: { id: true },
        });
        categoryIdMap.set(cat.key, created.id);
      }

      // 4e. Créer les services
      if (services.length > 0) {
        await tx.service.createMany({
          data: services.map((svc) => ({
            organizationId: session.organizationId,
            salonId: salon.id,
            categoryId: svc.categoryKey
              ? (categoryIdMap.get(svc.categoryKey) ?? null)
              : null,
            name: svc.name,
            description: svc.description || null,
            durationMinutes: svc.durationMinutes,
            priceCents: Math.round(svc.priceEuros * 100),
            currency: "EUR",
            color: svc.color || null,
            isActive: svc.isActive,
          })),
        });
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "SALON_NOT_FOUND") {
      return { error: "Salon introuvable. Veuillez contacter le support." };
    }
    if (msg === "APPOINTMENTS_EXIST") {
      return {
        error:
          "Des rendez-vous existent déjà pour ce salon. Modifiez vos services depuis le tableau de bord.",
      };
    }
    return { error: "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer." };
  }

  // ── 5. Étape 3 terminée → étape suivante ─────────────────────────────────
  redirect("/dashboard");
}
