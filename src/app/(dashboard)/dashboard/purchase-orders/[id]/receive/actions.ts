"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import { ReceiveStockSchema } from "@/features/purchase-orders/purchase-order.schema";
import { receiveStock } from "@/features/purchase-orders/receipt.service";
import type { ReceiveStockFormState } from "@/features/purchase-orders/types";

export async function receiveStockAction(
  orderId: string,
  _prev: ReceiveStockFormState,
  formData: FormData,
): Promise<ReceiveStockFormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePurchaseOrders(session, session.organizationId)) {
    return { error: "Accès non autorisé." };
  }

  // Parse indexed form lines (purchaseOrderLineId_0, productId_0, ...)
  const lines: {
    purchaseOrderLineId: string;
    productId:           string;
    quantityReceived:    number;
    unitCostCents:       number;
  }[] = [];

  let i = 0;
  while (formData.has(`purchaseOrderLineId_${i}`)) {
    const lineId    = formData.get(`purchaseOrderLineId_${i}`) as string;
    const productId = formData.get(`productId_${i}`) as string;
    const qtyStr    = (formData.get(`quantityReceived_${i}`) as string) ?? "0";
    const costStr   = (formData.get(`unitCostEuros_${i}`) as string) ?? "0";

    const qty  = parseInt(qtyStr, 10);
    const cost = Math.round(parseFloat(costStr) * 100);

    if (qty > 0 && lineId && productId && !isNaN(cost)) {
      lines.push({ purchaseOrderLineId: lineId, productId, quantityReceived: qty, unitCostCents: cost });
    }
    i++;
  }

  const raw = {
    purchaseOrderId: orderId,
    salonId:         salon.id,
    organizationId:  session.organizationId,
    notes:           (formData.get("receiveNotes") as string) || undefined,
    lines,
  };

  const result = ReceiveStockSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await receiveStock(result.data, session.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/dashboard/purchase-orders/${orderId}`);
}
