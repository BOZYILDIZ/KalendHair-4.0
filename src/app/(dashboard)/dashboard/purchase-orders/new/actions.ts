"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import { CreatePurchaseOrderSchema } from "@/features/purchase-orders/purchase-order.schema";
import { createPurchaseOrder } from "@/features/purchase-orders/purchase-order.service";
import type { PurchaseOrderFormState } from "@/features/purchase-orders/types";

export async function createPurchaseOrderAction(
  _prev: PurchaseOrderFormState,
  formData: FormData,
): Promise<PurchaseOrderFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePurchaseOrders(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const raw = {
    salonId:        salon.id,
    organizationId: session.organizationId,
    supplierId:     (formData.get("supplierId") as string) ?? "",
    reference:      (formData.get("reference") as string) || undefined,
    expectedAt:     (formData.get("expectedAt") as string) || undefined,
    notes:          (formData.get("notes") as string) || undefined,
  };

  const result = CreatePurchaseOrderSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  let orderId: string;
  try {
    const order = await createPurchaseOrder(result.data, session.id);
    orderId = order.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/purchase-orders/${orderId}/lines`);
}
