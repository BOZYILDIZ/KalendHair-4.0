"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { RecordEntrySchema } from "@/features/inventory/product.schema";
import { recordEntry } from "@/features/inventory/stock.service";

type State = { error?: string } | null;

export async function recordEntryAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const costRaw = formData.get("costPriceCents") as string;

  const raw = {
    productId:      formData.get("productId"),
    salonId:        salon.id,
    organizationId: session.organizationId,
    quantity:       parseInt((formData.get("quantity") as string) ?? "0", 10),
    costPriceCents: costRaw ? Math.round(parseFloat(costRaw) * 100) : undefined,
    notes:          (formData.get("notes") as string) || undefined,
  };

  const result = RecordEntrySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await recordEntry(result.data, session.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  const productId = result.data.productId;
  redirect(`/dashboard/inventory/products/${productId}`);
}
