"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePayment } from "@/lib/permissions/payment.permissions";
import { CreateFreePaymentSchema } from "@/features/payments/payment.schema";
import { createFreePayment } from "@/features/payments/payment.service";
import type { PaymentFormState } from "@/features/payments/types";

export async function createFreePaymentAction(
  _prev: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePayment(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  // Parse euros → cents (never accept totalCents from client)
  const amountEuros      = parseFloat((formData.get("amountEuros") as string) ?? "");
  const unitPriceEuros   = parseFloat((formData.get("unitPriceEuros") as string) ?? "");
  const quantity         = parseInt((formData.get("quantity") as string) ?? "1", 10);

  if (isNaN(amountEuros) || amountEuros <= 0)    return { error: "Montant invalide." };
  if (isNaN(unitPriceEuros) || unitPriceEuros <= 0) return { error: "Prix unitaire invalide." };
  if (isNaN(quantity) || quantity < 1)            return { error: "Quantité invalide." };

  const amountCents      = Math.round(amountEuros * 100);
  const unitPriceCents   = Math.round(unitPriceEuros * 100);

  const raw = {
    amountCents,
    method:    formData.get("method"),
    paidAt:    formData.get("paidAt"),
    notes:     formData.get("notes") || undefined,
    guestName: formData.get("guestName") || undefined,
    line: {
      label:          formData.get("lineLabel"),
      unitPriceCents,
      quantity,
    },
  };

  const result = CreateFreePaymentSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await createFreePayment(salon.id, session.organizationId, result.data, session.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/payments");
}
