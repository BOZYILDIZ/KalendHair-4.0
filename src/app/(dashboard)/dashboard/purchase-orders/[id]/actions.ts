"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import {
  sendPurchaseOrder,
  cancelPurchaseOrder,
} from "@/features/purchase-orders/purchase-order.service";
import type { PurchaseOrderFormState } from "@/features/purchase-orders/types";

export async function sendOrderAction(
  id: string,
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
    await sendPurchaseOrder(id, salon.id, session.organizationId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/purchase-orders/${id}`);
}

export async function cancelOrderAction(
  id: string,
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
    await cancelPurchaseOrder(id, salon.id, session.organizationId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/purchase-orders/${id}`);
}
