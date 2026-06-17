"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/permissions/organization.permissions";
import { UpdateOrganizationSchema } from "@/features/organizations/organization.schema";
import { updateOrganization } from "@/features/organizations/organization.service";
import type { OrganizationFormState } from "@/features/organizations/types";

export async function updateOrganizationAction(
  _prevState: OrganizationFormState,
  formData: FormData,
): Promise<OrganizationFormState> {
  const session = await requireSession();

  if (!canManageOrganization(session, session.organizationId)) {
    return { message: "Non autorisé." };
  }

  const raw = {
    name: formData.get("name")?.toString().trim() ?? "",
  };

  const result = UpdateOrganizationSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      errors: {
        name: fieldErrors.name,
      },
    };
  }

  await updateOrganization(session.organizationId, result.data);
  revalidatePath("/dashboard/organization");
  revalidatePath("/dashboard");

  return { success: true };
}
