"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { UpdateProductSchema } from "@/features/inventory/product.schema";
import { updateProduct, deactivateProduct } from "@/features/inventory/product.service";

type State = { error?: string } | null;

export async function updateProductAction(
  id: string,
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const priceRaw    = formData.get("priceCents") as string;
  const costRaw     = formData.get("costPriceCents") as string;
  const rawCategory = formData.get("categoryId") as string;

  const raw: Record<string, unknown> = {};
  if (formData.has("name"))              raw["name"]              = formData.get("name");
  if (formData.has("description"))       raw["description"]       = formData.get("description") || null;
  if (formData.has("unit"))              raw["unit"]              = formData.get("unit");
  if (formData.has("lowStockThreshold")) raw["lowStockThreshold"] = parseInt((formData.get("lowStockThreshold") as string) ?? "5", 10);
  if (priceRaw)   raw["priceCents"]     = Math.round(parseFloat(priceRaw) * 100);
  if (costRaw)    raw["costPriceCents"] = Math.round(parseFloat(costRaw) * 100);
  if (rawCategory !== null) raw["categoryId"] = rawCategory || null;

  const result = UpdateProductSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await updateProduct(id, salon.id, session.organizationId, result.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/inventory/products/${id}`);
}

export async function deactivateProductAction(
  id: string,
  _prev: State,
  _formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  try {
    await deactivateProduct(id, salon.id, session.organizationId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect("/dashboard/inventory/products");
}
