"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canManageAppointment } from "@/lib/permissions/appointment.permissions";
import {
  UpdateAppointmentSchema,
  CancelAppointmentSchema,
  UpdateStatusSchema,
} from "@/features/appointments/appointment.schema";
import {
  updateAppointment,
  cancelAppointment,
  updateAppointmentStatus,
} from "@/features/appointments/appointment.service";
import type {
  AppointmentFormState,
  CancelFormState,
  StatusFormState,
} from "@/features/appointments/types";

export async function updateAppointmentAction(
  _prevState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const session = await getSession();
  if (!session) return { success: false, message: "Non authentifié" };
  if (!canManageAppointment(session, session.organizationId)) {
    return { success: false, message: "Accès non autorisé" };
  }

  const raw = {
    appointmentId: formData.get("appointmentId"),
    date:          formData.get("date") || undefined,
    startTime:     formData.get("startTime") || undefined,
    employeeId:    formData.get("employeeId") || undefined,
    notes:         formData.get("notes"),
  };

  const result = UpdateAppointmentSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as string;
      if (key) {
        fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
      }
    }
    return { success: false, errors: fieldErrors };
  }

  const updated = await updateAppointment(
    result.data.appointmentId,
    session.organizationId,
    result.data,
    session.id,
  );
  if (!updated.ok) return { success: false, message: updated.error };

  redirect(`/dashboard/appointments/${result.data.appointmentId}`);
}

export async function cancelAppointmentAction(
  _prevState: CancelFormState,
  formData: FormData,
): Promise<CancelFormState> {
  const session = await getSession();
  if (!session) return { success: false, message: "Non authentifié" };
  if (!canManageAppointment(session, session.organizationId)) {
    return { success: false, message: "Accès non autorisé" };
  }

  const raw = {
    appointmentId: formData.get("appointmentId"),
    reason:        formData.get("reason"),
  };

  const result = CancelAppointmentSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: { reason: result.error.issues.map((i) => i.message) },
    };
  }

  const cancelled = await cancelAppointment(
    result.data.appointmentId,
    session.organizationId,
    result.data.reason,
    session.id,
  );
  if (!cancelled.ok) return { success: false, message: cancelled.error };

  return { success: true, message: "Rendez-vous annulé." };
}

export async function updateStatusAction(
  _prevState: StatusFormState,
  formData: FormData,
): Promise<StatusFormState> {
  const session = await getSession();
  if (!session) return { success: false, message: "Non authentifié" };
  if (!canManageAppointment(session, session.organizationId)) {
    return { success: false, message: "Accès non autorisé" };
  }

  const raw = {
    appointmentId: formData.get("appointmentId"),
    newStatus:     formData.get("newStatus"),
  };

  const result = UpdateStatusSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, message: "Données invalides" };
  }

  const updated = await updateAppointmentStatus(
    result.data.appointmentId,
    session.organizationId,
    result.data.newStatus,
    session.id,
  );
  if (!updated.ok) return { success: false, message: updated.error };

  return { success: true, message: "Statut mis à jour." };
}
