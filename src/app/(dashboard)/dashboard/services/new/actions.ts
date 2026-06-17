"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canManageService } from "@/lib/permissions/service.permissions";
import { CreateServiceSchema } from "@/features/services/service.schema";
import { createService } from "@/features/services/service.service";
import { getSalon } from "@/features/salons/salon.service";
import type { ServiceFormState } from "@/features/services/types";

export async function createServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const session = await requireSession();

  if (!canManageService(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const salon = await getSalon(session.organizationId);
  if (!salon) {
    return { message: "Salon introuvable. Configurez votre salon d'abord." };
  }

  const raw = {
    name: formData.get("name")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() ?? "",
    durationMinutes: formData.get("durationMinutes")?.toString() ?? "",
    price: formData.get("price")?.toString() ?? "",
  };

  const result = CreateServiceSchema.safeParse(raw);
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

  const service = await createService(salon.id, session.organizationId, result.data);
  redirect(`/dashboard/services/${service.id}`);
}
