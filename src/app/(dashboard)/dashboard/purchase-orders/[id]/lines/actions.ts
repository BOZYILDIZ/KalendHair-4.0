"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import { AddPurchaseOrderLineSchema } from "@/features/purchase-orders/purchase-order.schema";
import { addOrderLine, removeOrderLine } from "@/features/purchase-orders/purchase-order.service";
import type { PurchaseOrderFormState } from "@/features/purchase-orders/types";

export async function addOrderLineAction(
  orderId: string,
  _prev: PurchaseOrderFormState,
  formData: FormData,
): Promise<PurchaseOrderFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePurchaseOrders(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  const costRaw = (formData.get("unitCostEuros") as string) ?? "0";

  const raw = {
    salonId:         salon.id,
    organizationId:  session.organizationId,
    purchaseOrderId: orderId,
    productId:       (formData.get("productId") as string) ?? "",
    quantityOrdered: parseInt((formData.get("quantityOrdered") as string) ?? "0", 10),
    unitCostCents:   Math.round(parseFloat(costRaw) * 100),
    notes:           (formData.get("linNotes") as string) || undefined,
  };

  const result = AddPurchaseOrderLineSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await addOrderLine(result.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/purchase-orders/${orderId}/lines`);
}

export async function removeOrderLineAction(
  lineId: string,
  orderId: string,
  _prev: PurchaseOrderFormState,
  _formData: FormData,
): Promise<PurchaseOrderFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePurchaseOrders(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  try {
    await removeOrderLine(lineId, orderId, salon.id, session.organizationId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/purchase-orders/${orderId}/lines`);
}
