import { prisma } from "@/lib/db/prisma";
import { applyStockMovement } from "@/features/inventory/stock.service";
import type { ReceiveStockData } from "./purchase-order.schema";

export async function receiveStock(
  data: ReceiveStockData,
  proUserId: string,
): Promise<{ receiptId: string }> {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Load order with lines and existing receipt lines
    const order = await tx.purchaseOrder.findFirst({
      where: {
        id:             data.purchaseOrderId,
        salonId:        data.salonId,
        organizationId: data.organizationId,
        isActive:       true,
      },
      include: {
        lines: {
          where:   { isActive: true },
          include: { receiptLines: { select: { quantityReceived: true } } },
        },
      },
    });
    if (!order) throw new Error("Bon de commande introuvable.");
    if (order.status !== "SENT" && order.status !== "PARTIALLY_RECEIVED") {
      throw new Error(
        `Réception impossible : statut actuel "${order.status}". Le bon doit être SENT ou PARTIALLY_RECEIVED.`,
      );
    }

    // 2. Build remaining quantities per line
    const lineMap = new Map(
      order.lines.map((l) => {
        const alreadyReceived = l.receiptLines.reduce((s, r) => s + r.quantityReceived, 0);
        const remaining       = l.quantityOrdered - alreadyReceived;
        return [l.id, { ...l, alreadyReceived, remaining }];
      }),
    );

    // 3. Validate all incoming lines before touching the DB
    for (const incoming of data.lines) {
      const line = lineMap.get(incoming.purchaseOrderLineId);
      if (!line) {
        throw new Error(`Ligne de commande introuvable : ${incoming.purchaseOrderLineId}`);
      }
      if (incoming.quantityReceived > line.remaining) {
        throw new Error(
          `Quantité reçue (${incoming.quantityReceived}) dépasse le reste à recevoir (${line.remaining}).`,
        );
      }
    }

    // 4. Create the receipt header
    const receipt = await tx.purchaseOrderReceipt.create({
      data: {
        salonId:            data.salonId,
        organizationId:     data.organizationId,
        purchaseOrderId:    data.purchaseOrderId,
        notes:              data.notes || null,
        createdByProUserId: proUserId,
      },
      select: { id: true },
    });

    // 5. Process each line — productId is always taken from the server-loaded lineMap,
    //    never from incoming (FormData) to prevent cross-tenant writes.
    for (const incoming of data.lines) {
      const line = lineMap.get(incoming.purchaseOrderLineId);
      if (!line) continue;

      const verifiedProductId = line.productId;

      // Get current stock level
      const stock = await tx.productStock.findUnique({
        where:  { productId: verifiedProductId },
        select: { quantity: true },
      });
      const quantityBefore = stock?.quantity ?? 0;

      // Apply stock movement — returns { id } for receipt line linking
      const movement = await applyStockMovement(tx, {
        salonId:            data.salonId,
        organizationId:     data.organizationId,
        productId:          verifiedProductId,
        type:               "PURCHASE_RECEIPT",
        quantityDelta:      incoming.quantityReceived,
        quantityBefore,
        costPriceCents:     incoming.unitCostCents,
        referenceId:        receipt.id,
        referenceType:      "PURCHASE_ORDER_RECEIPT",
        createdByProUserId: proUserId,
      });

      // Update product cost price to the latest purchase price
      await tx.product.update({
        where: { id: verifiedProductId },
        data:  { costPriceCents: incoming.unitCostCents },
      });

      // Create receipt line linked to the stock movement
      await tx.purchaseOrderReceiptLine.create({
        data: {
          receiptId:           receipt.id,
          purchaseOrderLineId: incoming.purchaseOrderLineId,
          productId:           verifiedProductId,
          quantityReceived:    incoming.quantityReceived,
          unitCostCents:       incoming.unitCostCents,
          totalCostCents:      incoming.quantityReceived * incoming.unitCostCents,
          stockMovementId:     movement.id,
        },
      });
    }

    // 6. Determine new order status
    const newReceivedByLine = new Map<string, number>();
    for (const l of order.lines) {
      const prev   = lineMap.get(l.id)?.alreadyReceived ?? 0;
      const added  = data.lines.find((i) => i.purchaseOrderLineId === l.id)?.quantityReceived ?? 0;
      newReceivedByLine.set(l.id, prev + added);
    }
    const fullyReceived = order.lines.every(
      (l) => (newReceivedByLine.get(l.id) ?? 0) >= l.quantityOrdered,
    );

    await tx.purchaseOrder.update({
      where: { id: data.purchaseOrderId },
      data:  { status: fullyReceived ? "RECEIVED" : "PARTIALLY_RECEIVED" },
    });

    return { receiptId: receipt.id };
  });

  return result;
}
