"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { canManageSchedule } from "@/lib/permissions/schedule.permissions";
import { getSalon } from "@/features/salons/salon.service";
import { ClosedDaySchema } from "@/features/schedules/schedule.schema";
import { addClosedDay, removeClosedDay } from "@/features/schedules/closed-day.service";
import type { ClosedDayFormState } from "@/features/schedules/types";

export async function addClosedDayAction(
  _prevState: ClosedDayFormState,
  formData: FormData,
): Promise<ClosedDayFormState> {
  const session = await requireSession();

  if (!canManageSchedule(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const salon = await getSalon(session.organizationId);
  if (!salon) return { message: "Salon introuvable." };

  const raw = {
    date:   formData.get("date")?.toString().trim() ?? "",
    reason: formData.get("reason")?.toString().trim() || undefined,
  };

  const result = ClosedDaySchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return { errors: { date: fieldErrors.date, reason: fieldErrors.reason } };
  }

  const addResult = await addClosedDay(
    salon.id,
    session.organizationId,
    result.data.date,
    result.data.reason,
  );

  if (!addResult.ok) return { message: addResult.error };

  revalidatePath("/dashboard/closed-days");
  return { success: true, message: "Jour de fermeture ajouté." };
}

export async function removeClosedDayAction(formData: FormData): Promise<void> {
  const session = await requireSession();

  if (!canManageSchedule(session, session.organizationId)) return;

  const salon = await getSalon(session.organizationId);
  if (!salon) return;

  const closedDayId = formData.get("closedDayId")?.toString();
  if (!closedDayId) return;

  await removeClosedDay(closedDayId, salon.id, session.organizationId);
  revalidatePath("/dashboard/closed-days");
}
