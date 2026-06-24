"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageSuppliers } from "@/lib/permissions/supplier.permissions";
import { UpdateSupplierSchema } from "@/features/suppliers/supplier.schema";
import { updateSupplier, deactivateSupplier } from "@/features/suppliers/supplier.service";
import type { SupplierFormState } from "@/features/suppliers/types";

export async function updateSupplierAction(
  id: string,
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

  const result = UpdateSupplierSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await updateSupplier(id, result.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/suppliers/${id}`);
}

export async function deactivateSupplierAction(
  id: string,
  _prev: SupplierFormState,
  _formData: FormData,
): Promise<SupplierFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageSuppliers(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  try {
    await deactivateSupplier(id, salon.id, session.organizationId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/suppliers");
}
