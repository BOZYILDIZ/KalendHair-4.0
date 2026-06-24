"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { UpgradePlanSchema, ChangeBillingCycleSchema } from "@/features/billing/billing.schema";
import { upsertSubscription, getCurrentSubscription } from "@/features/billing/billing.service";
import type { UpgradePlanFormState } from "@/features/billing/types";

export async function upgradePlanAction(
  _prev: UpgradePlanFormState,
  formData: FormData,
): Promise<UpgradePlanFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon) return { error: "Salon introuvable." };

  const raw = {
    organizationId: session.organizationId,
    planCode:       formData.get("planCode") as string,
    billingCycle:   formData.get("billingCycle") as string,
  };

  const result = UpgradePlanSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await upsertSubscription(
      session.organizationId,
      result.data.planCode,
      result.data.billingCycle,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/billing");
}

export async function changeBillingCycleAction(
  _prev: UpgradePlanFormState,
  formData: FormData,
): Promise<UpgradePlanFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const raw = {
    organizationId: session.organizationId,
    billingCycle:   formData.get("billingCycle") as string,
  };

  const result = ChangeBillingCycleSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  const sub = await getCurrentSubscription(session.organizationId);
  if (!sub) return { error: "Aucun abonnement actif. Choisissez d'abord un plan." };

  try {
    await upsertSubscription(session.organizationId, sub.planCode, result.data.billingCycle);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/billing");
}
