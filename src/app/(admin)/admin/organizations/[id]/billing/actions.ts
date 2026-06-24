"use server";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import {
  changeOrganizationPlan,
  grantFreePlan,
  revokeFreePlan,
  createDiscount,
  deactivateDiscount,
  extendTrial,
} from "@/features/admin/admin.service";
import {
  ChangePlanSchema,
  GrantFreePlanSchema,
  RevokeFreePlanSchema,
  CreateDiscountSchema,
  DeactivateDiscountSchema,
  ExtendTrialSchema,
} from "@/features/admin/admin.schema";
import type { AdminActionState } from "@/features/admin/types";

function billingRedirect(orgId: string): never {
  redirect(`/admin/organizations/${orgId}/billing`);
}

export async function changePlanAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Non authentifié." };

  const orgId = formData.get("orgId") as string;
  if (!orgId) return { error: "ID organisation manquant." };

  const result = ChangePlanSchema.safeParse({
    planCode: formData.get("planCode"),
    billingCycle: formData.get("billingCycle"),
    reason: formData.get("reason"),
  });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await changeOrganizationPlan(
      session.sub,
      orgId,
      result.data.planCode,
      result.data.billingCycle,
      result.data.reason,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  billingRedirect(orgId);
}

export async function grantFreePlanAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Non authentifié." };

  const orgId = formData.get("orgId") as string;
  if (!orgId) return { error: "ID organisation manquant." };

  const result = GrantFreePlanSchema.safeParse({ reason: formData.get("reason") });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await grantFreePlan(session.sub, orgId, result.data.reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  billingRedirect(orgId);
}

export async function revokeFreePlanAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Non authentifié." };

  const orgId = formData.get("orgId") as string;
  if (!orgId) return { error: "ID organisation manquant." };

  const result = RevokeFreePlanSchema.safeParse({ reason: formData.get("reason") });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await revokeFreePlan(session.sub, orgId, result.data.reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  billingRedirect(orgId);
}

export async function createDiscountAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Non authentifié." };

  const orgId = formData.get("orgId") as string;
  const subscriptionId = formData.get("subscriptionId") as string;
  if (!orgId || !subscriptionId)
    return { error: "Données de contexte manquantes." };

  const result = CreateDiscountSchema.safeParse({
    type: formData.get("type"),
    value: formData.get("value"),
    reason: formData.get("reason"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await createDiscount(session.sub, orgId, result.data, subscriptionId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  billingRedirect(orgId);
}

export async function deactivateDiscountAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Non authentifié." };

  const orgId = formData.get("orgId") as string;
  if (!orgId) return { error: "ID organisation manquant." };

  const result = DeactivateDiscountSchema.safeParse({
    discountId: formData.get("discountId"),
    reason: formData.get("reason"),
  });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await deactivateDiscount(
      session.sub,
      orgId,
      result.data.discountId,
      result.data.reason,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  billingRedirect(orgId);
}

export async function extendTrialAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Non authentifié." };

  const orgId = formData.get("orgId") as string;
  if (!orgId) return { error: "ID organisation manquant." };

  const result = ExtendTrialSchema.safeParse({
    newTrialEndsAt: formData.get("newTrialEndsAt"),
    reason: formData.get("reason"),
  });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await extendTrial(
      session.sub,
      orgId,
      new Date(result.data.newTrialEndsAt),
      result.data.reason,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  billingRedirect(orgId);
}
