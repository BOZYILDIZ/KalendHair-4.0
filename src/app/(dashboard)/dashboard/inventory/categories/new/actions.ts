"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { CreateProductCategorySchema } from "@/features/inventory/product.schema";
import { createProductCategory } from "@/features/inventory/product.service";

type State = { error?: string } | null;

export async function createProductCategoryAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const raw = {
    salonId:        salon.id,
    organizationId: session.organizationId,
    name:           formData.get("name"),
  };

  const result = CreateProductCategorySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await createProductCategory(result.data);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: "Une catégorie portant ce nom existe déjà pour ce salon." };
    }
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/inventory/categories");
}
