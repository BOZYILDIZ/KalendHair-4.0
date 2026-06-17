"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { canManageEmployee } from "@/lib/permissions/employee.permissions";
import { UpdateEmployeeSchema } from "@/features/employees/employee.schema";
import {
  updateEmployee,
  deactivateEmployee,
  reactivateEmployee,
  findPotentialDuplicate,
  getEmployee,
} from "@/features/employees/employee.service";
import { getServices } from "@/features/services/service.service";
import { syncEmployeeServices } from "@/features/employees/employee-service.service";
import { getSalon } from "@/features/salons/salon.service";
import type { EmployeeFormState } from "@/features/employees/types";

export async function updateEmployeeAction(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const session = await requireSession();

  if (!canManageEmployee(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const employeeId = formData.get("employeeId")?.toString() ?? "";

  const raw = {
    firstName: formData.get("firstName")?.toString().trim() ?? "",
    lastName: formData.get("lastName")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() ?? "",
    phone: formData.get("phone")?.toString().trim() ?? "",
    color: formData.get("color")?.toString().trim() ?? "",
  };

  const result = UpdateEmployeeSchema.safeParse(raw);
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

  await updateEmployee(employeeId, session.organizationId, result.data);
  revalidatePath(`/dashboard/employees/${employeeId}`);
  revalidatePath("/dashboard/employees");

  return { success: true };
}

export async function deactivateEmployeeAction(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const session = await requireSession();

  if (!canManageEmployee(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const employeeId = formData.get("employeeId")?.toString() ?? "";
  await deactivateEmployee(employeeId, session.organizationId);
  redirect("/dashboard/employees");
}

export async function reactivateEmployeeAction(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const session = await requireSession();

  if (!canManageEmployee(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const employeeId = formData.get("employeeId")?.toString() ?? "";
  const confirmed = formData.get("confirmed") === "true";

  const employee = await getEmployee(employeeId, session.organizationId);
  if (!employee) {
    return { message: "Employé introuvable." };
  }

  const salon = await getSalon(session.organizationId);
  if (!salon) {
    return { message: "Salon introuvable." };
  }

  if (!confirmed) {
    const isDuplicate = await findPotentialDuplicate(
      salon.id,
      employee.firstName,
      employee.lastName,
      employeeId,
    );
    if (isDuplicate) {
      return {
        warning: `Un employé "${employee.firstName} ${employee.lastName}" est déjà actif dans ce salon. Souhaitez-vous réactiver cet employé quand même ?`,
        requireConfirmation: true,
        pendingData: {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email ?? "",
          phone: employee.phone ?? "",
          color: employee.color ?? "",
        },
      };
    }
  }

  await reactivateEmployee(employeeId, session.organizationId);
  revalidatePath(`/dashboard/employees/${employeeId}`);
  revalidatePath("/dashboard/employees");

  return { success: true };
}

export async function syncServicesAction(
  _prevState: { success?: boolean; message?: string } | null,
  formData: FormData,
): Promise<{ success?: boolean; message?: string } | null> {
  const session = await requireSession();

  if (!canManageEmployee(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const employeeId = formData.get("employeeId")?.toString() ?? "";
  const serviceIds = formData.getAll("serviceIds").map(String);

  const salon = await getSalon(session.organizationId);
  if (!salon) {
    return { message: "Salon introuvable." };
  }

  const salonServices = await getServices(salon.id, session.organizationId);
  const salonServiceIds = salonServices.map((s) => s.id);

  await syncEmployeeServices(
    employeeId,
    session.organizationId,
    serviceIds,
    salonServiceIds,
  );

  revalidatePath(`/dashboard/employees/${employeeId}`);
  return { success: true };
}
