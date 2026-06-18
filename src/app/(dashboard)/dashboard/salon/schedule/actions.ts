"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { canManageSchedule } from "@/lib/permissions/schedule.permissions";
import { getSalon } from "@/features/salons/salon.service";
import { SalonScheduleDaySchema } from "@/features/schedules/schedule.schema";
import { saveSalonSchedule } from "@/features/schedules/salon-schedule.service";
import { DAYS_OF_WEEK, type ScheduleFormState } from "@/features/schedules/types";

export async function saveSalonScheduleAction(
  _prevState: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const session = await requireSession();

  if (!canManageSchedule(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const salon = await getSalon(session.organizationId);
  if (!salon) return { message: "Salon introuvable." };

  const errors: Record<string, string[]> = {};
  const days = [];

  for (const day of DAYS_OF_WEEK) {
    const isOpen     = formData.get(`${day}_isOpen`) === "on";
    const startRaw   = formData.get(`${day}_start`)?.toString() ?? "09:00";
    const endRaw     = formData.get(`${day}_end`)?.toString() ?? "18:00";

    const [sh, sm]   = startRaw.split(":").map(Number);
    const [eh, em]   = endRaw.split(":").map(Number);
    const startMinute = (sh ?? 9) * 60 + (sm ?? 0);
    const endMinute   = (eh ?? 18) * 60 + (em ?? 0);

    const result = SalonScheduleDaySchema.safeParse({ dayOfWeek: day, isOpen, startMinute, endMinute });
    if (!result.success) {
      errors[day] = result.error.issues.map((issue) => issue.message);
    } else {
      days.push(result.data);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await saveSalonSchedule(salon.id, session.organizationId, days);
  revalidatePath("/dashboard/salon/schedule");

  return { success: true, message: "Horaires enregistrés." };
}
