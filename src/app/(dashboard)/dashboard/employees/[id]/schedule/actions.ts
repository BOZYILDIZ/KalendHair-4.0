"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { canManageSchedule } from "@/lib/permissions/schedule.permissions";
import { getSalon } from "@/features/salons/salon.service";
import { EmployeeScheduleDaySchema } from "@/features/schedules/schedule.schema";
import { getSalonSchedule } from "@/features/schedules/salon-schedule.service";
import { saveEmployeeSchedule } from "@/features/schedules/employee-schedule.service";
import { DAYS_OF_WEEK, type ScheduleFormState } from "@/features/schedules/types";

export async function saveEmployeeScheduleAction(
  _prevState: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const session = await requireSession();

  if (!canManageSchedule(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const employeeId = formData.get("employeeId")?.toString();
  if (!employeeId) return { message: "Employé introuvable." };

  const salon = await getSalon(session.organizationId);
  if (!salon) return { message: "Salon introuvable." };

  const salonSchedule = await getSalonSchedule(salon.id, session.organizationId);

  const errors: Record<string, string[]> = {};
  const days = [];

  for (const day of DAYS_OF_WEEK) {
    const isWorking  = formData.get(`${day}_isWorking`) === "on";
    const startRaw   = formData.get(`${day}_start`)?.toString() ?? "09:00";
    const endRaw     = formData.get(`${day}_end`)?.toString() ?? "18:00";

    const [sh, sm]    = startRaw.split(":").map(Number);
    const [eh, em]    = endRaw.split(":").map(Number);
    const startMinute = (sh ?? 9) * 60 + (sm ?? 0);
    const endMinute   = (eh ?? 18) * 60 + (em ?? 0);

    const result = EmployeeScheduleDaySchema.safeParse({ dayOfWeek: day, isWorking, startMinute, endMinute });
    if (!result.success) {
      errors[day] = result.error.issues.map((issue) => issue.message);
    } else {
      days.push(result.data);
    }
  }

  if (Object.keys(errors).length > 0) return { errors };

  const saveResult = await saveEmployeeSchedule(
    employeeId,
    session.organizationId,
    salonSchedule,
    days,
  );

  if (!saveResult.ok) {
    if ("fieldErrors" in saveResult) {
      const convertedErrors: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(saveResult.fieldErrors)) {
        convertedErrors[k] = [v];
      }
      return { errors: convertedErrors };
    }
    return { message: saveResult.error };
  }

  revalidatePath(`/dashboard/employees/${employeeId}/schedule`);
  return { success: true, message: "Horaires enregistrés." };
}
