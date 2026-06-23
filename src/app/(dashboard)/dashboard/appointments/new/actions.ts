"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageAppointment } from "@/lib/permissions/appointment.permissions";
import { CreateAppointmentSchema } from "@/features/appointments/appointment.schema";
import { createAppointment } from "@/features/appointments/appointment.service";
import type { AppointmentFormState } from "@/features/appointments/types";

export async function createAppointmentAction(
  _prevState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const session = await getSession();
  if (!session) return { success: false, message: "Non authentifié" };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageAppointment(session, session.organizationId)) {
    return { success: false, message: "Accès non autorisé" };
  }

  const raw = {
    employeeId:     formData.get("employeeId"),
    serviceId:      formData.get("serviceId"),
    date:           formData.get("date"),
    startTime:      formData.get("startTime"),
    guestFirstName: formData.get("guestFirstName"),
    guestLastName:  formData.get("guestLastName"),
    guestEmail:     formData.get("guestEmail"),
    guestPhone:     formData.get("guestPhone"),
    notes:          formData.get("notes"),
  };

  const result = CreateAppointmentSchema.safeParse(raw);
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

  const created = await createAppointment(
    salon.id,
    session.organizationId,
    result.data,
    session.id,
  );
  if (!created.ok) return { success: false, message: created.error };

  redirect(`/dashboard/appointments/${created.appointmentId}`);
}
