"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { canManageSalon } from "@/lib/permissions/salon.permissions";
import { UpdateSalonSchema } from "@/features/salons/salon.schema";
import { updateSalon } from "@/features/salons/salon.service";
import type { SalonFormState } from "@/features/salons/types";

export async function updateSalonAction(
  _prevState: SalonFormState,
  formData: FormData,
): Promise<SalonFormState> {
  const session = await requireSession();

  if (!canManageSalon(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const raw = {
    name: formData.get("name")?.toString().trim() ?? "",
    description: formData.get("description")?.toString() ?? "",
    phone: formData.get("phone")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() ?? "",
    address: formData.get("address")?.toString().trim() ?? "",
    city: formData.get("city")?.toString().trim() ?? "",
    postalCode: formData.get("postalCode")?.toString().trim() ?? "",
    timezone: formData.get("timezone")?.toString().trim() ?? "",
  };

  const result = UpdateSalonSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      errors: {
        name: fieldErrors.name,
        description: fieldErrors.description,
        phone: fieldErrors.phone,
        email: fieldErrors.email,
        address: fieldErrors.address,
        city: fieldErrors.city,
        postalCode: fieldErrors.postalCode,
        timezone: fieldErrors.timezone,
      },
    };
  }

  await updateSalon(session.organizationId, result.data);
  revalidatePath("/dashboard/salon");
  revalidatePath("/dashboard");

  return { success: true };
}
