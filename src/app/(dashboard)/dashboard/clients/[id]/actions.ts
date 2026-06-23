"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageClient } from "@/lib/permissions/client.permissions";
import { updateClientNotes, convertGuestToClient } from "@/features/clients/client.service";
import { UpdateNotesSchema } from "@/features/clients/client.schema";
import type { ClientNotesFormState, ConvertGuestFormState } from "@/features/clients/types";

export async function updateNotesAction(
  _prev: ClientNotesFormState,
  formData: FormData,
): Promise<ClientNotesFormState> {
  const session = await requireSession();
  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageClient(session, session.organizationId)) {
    return { success: false, error: "Accès refusé." };
  }

  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || !clientId) {
    return { success: false, error: "Client invalide." };
  }

  const raw = formData.get("notes");
  const parsed = UpdateNotesSchema.safeParse({
    notes: typeof raw === "string" && raw.trim() !== "" ? raw : null,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Erreur de validation." };
  }

  try {
    await updateClientNotes(salon.id, clientId, session.organizationId, parsed.data.notes);
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la sauvegarde." };
  }
}

export async function convertGuestAction(
  appointmentId: string,
): Promise<ConvertGuestFormState> {
  const session = await requireSession();
  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageClient(session, session.organizationId)) {
    return { success: false, error: "Accès refusé." };
  }

  try {
    const clientId = await convertGuestToClient(appointmentId, salon.id, session.organizationId);
    return { success: true, clientId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de la conversion.";
    return { success: false, error: message };
  }
}

export async function convertGuestAndRedirectAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageClient(session, session.organizationId)) redirect("/dashboard");

  const appointmentId = formData.get("appointmentId");
  if (typeof appointmentId !== "string") redirect("/dashboard");

  try {
    const clientId = await convertGuestToClient(appointmentId, salon.id, session.organizationId);
    redirect(`/dashboard/clients/${clientId}`);
  } catch {
    redirect(`/dashboard/appointments/${appointmentId}`);
  }
}
