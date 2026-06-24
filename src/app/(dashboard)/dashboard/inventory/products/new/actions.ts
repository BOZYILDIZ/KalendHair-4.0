"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { CreateProductSchema } from "@/features/inventory/product.schema";
import { createProduct } from "@/features/inventory/product.service";

type State = { error?: string } | null;

export async function createProductAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const priceEuros    = parseFloat((formData.get("priceCents") as string) ?? "");
  const costEuros     = formData.get("costPriceCents") as string;
  const rawCategory   = formData.get("categoryId") as string;

  if (isNaN(priceEuros) || priceEuros < 0) return { error: "Prix de vente invalide." };

  const raw = {
    salonId:           salon.id,
    organizationId:    session.organizationId,
    name:              formData.get("name"),
    description:       formData.get("description") || undefined,
    unit:              formData.get("unit") ?? "unité",
    priceCents:        Math.round(priceEuros * 100),
    costPriceCents:    costEuros ? Math.round(parseFloat(costEuros) * 100) : undefined,
    categoryId:        rawCategory || undefined,
    lowStockThreshold: parseInt((formData.get("lowStockThreshold") as string) ?? "5", 10),
  };

  const result = CreateProductSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await createProduct(result.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/inventory/products");
}
