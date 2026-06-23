"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePayment } from "@/lib/permissions/payment.permissions";
import { CreateAppointmentPaymentSchema } from "@/features/payments/payment.schema";
import { createPaymentForAppointment } from "@/features/payments/payment.service";
import type { PaymentFormState } from "@/features/payments/types";

export async function createAppointmentPaymentAction(
  _prev: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePayment(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const appointmentId = formData.get("appointmentId") as string | null;
  if (!appointmentId) return { error: "Rendez-vous non spécifié." };

  // Parse euros → cents (totalCents jamais accepté depuis le client)
  const amountEuros = parseFloat((formData.get("amountEuros") as string) ?? "");
  if (isNaN(amountEuros) || amountEuros <= 0) {
    return { error: "Montant invalide." };
  }
  const amountCents = Math.round(amountEuros * 100);

  const raw = {
    amountCents,
    method: formData.get("method"),
    paidAt: formData.get("paidAt"),
    notes:  formData.get("notes") || undefined,
  };

  const result = CreateAppointmentPaymentSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await createPaymentForAppointment(
      salon.id,
      session.organizationId,
      appointmentId,
      result.data,
      session.id,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/appointments/${appointmentId}`);
}
