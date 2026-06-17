"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canManageEmployee } from "@/lib/permissions/employee.permissions";
import { CreateEmployeeSchema } from "@/features/employees/employee.schema";
import {
  createEmployee,
  findPotentialDuplicate,
} from "@/features/employees/employee.service";
import { getSalon } from "@/features/salons/salon.service";
import type { EmployeeFormState } from "@/features/employees/types";

export async function createEmployeeAction(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const session = await requireSession();

  if (!canManageEmployee(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const salon = await getSalon(session.organizationId);
  if (!salon) {
    return { message: "Salon introuvable. Configurez votre salon d'abord." };
  }

  const raw = {
    firstName: formData.get("firstName")?.toString().trim() ?? "",
    lastName: formData.get("lastName")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() ?? "",
    phone: formData.get("phone")?.toString().trim() ?? "",
    color: formData.get("color")?.toString().trim() ?? "",
  };

  const result = CreateEmployeeSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      errors: {
        firstName: fieldErrors.firstName,
        lastName: fieldErrors.lastName,
        email: fieldErrors.email,
        phone: fieldErrors.phone,
        color: fieldErrors.color,
      },
    };
  }

  const confirmed = formData.get("confirmed") === "true";

  if (!confirmed) {
    const isDuplicate = await findPotentialDuplicate(
      salon.id,
      result.data.firstName,
      result.data.lastName,
    );
    if (isDuplicate) {
      return {
        warning: `Un employé "${result.data.firstName} ${result.data.lastName}" est déjà actif dans ce salon. Souhaitez-vous créer un deuxième employé avec ce nom ?`,
        requireConfirmation: true,
        pendingData: raw,
      };
    }
  }

  const employee = await createEmployee(salon.id, session.organizationId, result.data);
  redirect(`/dashboard/employees/${employee.id}`);
}
