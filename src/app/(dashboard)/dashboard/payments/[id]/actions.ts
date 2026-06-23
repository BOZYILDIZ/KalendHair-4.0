"use server";

import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePayment } from "@/lib/permissions/payment.permissions";
import { CancelPaymentSchema } from "@/features/payments/payment.schema";
import { cancelPayment } from "@/features/payments/payment.service";
import type { PaymentFormState } from "@/features/payments/types";

export async function cancelPaymentAction(
  _prev: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePayment(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const raw = { paymentId: formData.get("paymentId") };
  const result = CancelPaymentSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await cancelPayment(salon.id, session.organizationId, result.data.paymentId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  return { success: true };
}
