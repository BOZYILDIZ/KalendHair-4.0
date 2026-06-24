"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import {
  canManageCommissionRules,
} from "@/lib/permissions/commission.permissions";
import {
  createCommissionRule,
  updateCommissionRule,
  deactivateCommissionRule,
} from "@/features/commissions/commission-rule.service";
import {
  CreateCommissionRuleSchema,
  UpdateCommissionRuleSchema,
  DeactivateCommissionRuleSchema,
} from "@/features/commissions/commission.schema";
import type { RuleFormState } from "@/features/commissions/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthorizedContext(): Promise<
  { session: { id: string; organizationId: string }; salonId: string } | null
> {
  const session = await getSession();
  if (!session) return null;
  if (!canManageCommissionRules(session, session.organizationId)) return null;
  const salon = await getSalon(session.organizationId);
  if (!salon) return null;
  return { session, salonId: salon.id };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCommissionRuleAction(
  _prev: RuleFormState,
  formData: FormData,
): Promise<RuleFormState> {
  const ctx = await getAuthorizedContext();
  if (!ctx) return { error: "Non autorisé." };

  const raw = {
    employeeId: (formData.get("employeeId") as string) || undefined,
    serviceId:  (formData.get("serviceId")  as string) || undefined,
    productId:  (formData.get("productId")  as string) || undefined,
    type:       formData.get("type"),
    value:      formData.get("value"),
  };

  const result = CreateCommissionRuleSchema.safeParse(raw);
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await createCommissionRule(
      ctx.session.id,
      ctx.salonId,
      ctx.session.organizationId,
      result.data,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/commissions/rules");
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCommissionRuleAction(
  _prev: RuleFormState,
  formData: FormData,
): Promise<RuleFormState> {
  const ctx = await getAuthorizedContext();
  if (!ctx) return { error: "Non autorisé." };

  const result = UpdateCommissionRuleSchema.safeParse({
    ruleId: formData.get("ruleId"),
    type:   formData.get("type"),
    value:  formData.get("value"),
  });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await updateCommissionRule(
      result.data.ruleId,
      ctx.salonId,
      ctx.session.organizationId,
      result.data,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/commissions/rules");
}

// ─── Deactivate ───────────────────────────────────────────────────────────────

export async function deactivateCommissionRuleAction(
  _prev: RuleFormState,
  formData: FormData,
): Promise<RuleFormState> {
  const ctx = await getAuthorizedContext();
  if (!ctx) return { error: "Non autorisé." };

  const result = DeactivateCommissionRuleSchema.safeParse({
    ruleId: formData.get("ruleId"),
  });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await deactivateCommissionRule(
      result.data.ruleId,
      ctx.salonId,
      ctx.session.organizationId,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/commissions/rules");
}
