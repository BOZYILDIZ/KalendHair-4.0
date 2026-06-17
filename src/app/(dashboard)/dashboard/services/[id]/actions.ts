"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { canManageService } from "@/lib/permissions/service.permissions";
import { UpdateServiceSchema } from "@/features/services/service.schema";
import {
  updateService,
  deactivateService,
  reactivateService,
} from "@/features/services/service.service";
import type { ServiceFormState } from "@/features/services/types";

export async function updateServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const session = await requireSession();

  if (!canManageService(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const serviceId = formData.get("serviceId")?.toString() ?? "";

  const raw = {
    name: formData.get("name")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() ?? "",
    durationMinutes: formData.get("durationMinutes")?.toString() ?? "",
    price: formData.get("price")?.toString() ?? "",
  };

  const result = UpdateServiceSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      errors: {
        name: fieldErrors.name,
        description: fieldErrors.description,
        durationMinutes: fieldErrors.durationMinutes,
        price: fieldErrors.price,
      },
    };
  }

  await updateService(serviceId, session.organizationId, result.data);
  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");

  return { success: true };
}

export async function deactivateServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const session = await requireSession();

  if (!canManageService(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const serviceId = formData.get("serviceId")?.toString() ?? "";
  await deactivateService(serviceId, session.organizationId);
  redirect("/dashboard/services");
}

export async function reactivateServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const session = await requireSession();

  if (!canManageService(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const serviceId = formData.get("serviceId")?.toString() ?? "";
  await reactivateService(serviceId, session.organizationId);
  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");

  return { success: true };
}
