"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { SellProductSchema } from "@/features/inventory/product.schema";
import { createProductSalePayment } from "@/features/inventory/stock.service";

type State = { error?: string } | null;

export async function sellProductAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const raw = {
    productId:      formData.get("productId"),
    salonId:        salon.id,
    organizationId: session.organizationId,
    quantity:       parseInt((formData.get("quantity") as string) ?? "1", 10),
    method:         formData.get("method"),
    notes:          (formData.get("notes") as string) || undefined,
    guestName:      (formData.get("guestName") as string) || undefined,
  };

  const result = SellProductSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  let paymentId: string;
  try {
    const sale = await createProductSalePayment(result.data, session.id);
    paymentId = sale.paymentId;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/payments/${paymentId}`);
}
