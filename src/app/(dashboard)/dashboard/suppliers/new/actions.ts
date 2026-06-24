"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageSuppliers } from "@/lib/permissions/supplier.permissions";
import { CreateSupplierSchema } from "@/features/suppliers/supplier.schema";
import { createSupplier } from "@/features/suppliers/supplier.service";
import type { SupplierFormState } from "@/features/suppliers/types";

export async function createSupplierAction(
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageSuppliers(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const raw = {
    salonId:        salon.id,
    organizationId: session.organizationId,
    name:           (formData.get("name") as string) ?? "",
    contactName:    (formData.get("contactName") as string) || undefined,
    email:          (formData.get("email") as string) || undefined,
    phone:          (formData.get("phone") as string) || undefined,
    address:        (formData.get("address") as string) || undefined,
    notes:          (formData.get("notes") as string) || undefined,
  };

  const result = CreateSupplierSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  let supplierId: string;
  try {
    const supplier = await createSupplier(result.data);
    supplierId = supplier.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/suppliers/${supplierId}`);
}
