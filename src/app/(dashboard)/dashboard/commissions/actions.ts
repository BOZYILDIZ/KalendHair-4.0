"use server";

import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canAdjustCommissions } from "@/lib/permissions/commission.permissions";
import { adjustCommission } from "@/features/commissions/commission-entry.service";
import { AdjustCommissionSchema } from "@/features/commissions/commission.schema";
import type { AdjustFormState } from "@/features/commissions/types";

export async function adjustCommissionAction(
  _prev: AdjustFormState,
  formData: FormData,
): Promise<AdjustFormState> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé." };
  if (!canAdjustCommissions(session, session.organizationId))
    return { error: "Non autorisé." };

  const salon = await getSalon(session.organizationId);
  if (!salon) return { error: "Salon introuvable." };

  const result = AdjustCommissionSchema.safeParse({
    entryId:    formData.get("entryId"),
    deltaCents: formData.get("deltaCents"),
    reason:     formData.get("reason"),
  });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await adjustCommission(
      session.id,
      salon.id,
      session.organizationId,
      result.data.entryId,
      result.data.deltaCents,
      result.data.reason,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  return { success: true };
}
