import { prisma } from "@/lib/db/prisma";
import type { PurchaseOrderStatus } from "@prisma/client";
import type {
  PurchaseOrderView,
  PurchaseOrderSummary,
  PurchaseOrdersPage,
  PurchaseOrderLineView,
  PurchaseOrderReceiptView,
  PurchaseOrderReceiptLineView,
} from "./types";
import type {
  CreatePurchaseOrderData,
  AddPurchaseOrderLineData,
} from "./purchase-order.schema";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getPurchaseOrders(
  salonId: string,
  organizationId: string,
  opts: {
    page?: number;
    status?: PurchaseOrderStatus;
    supplierId?: string;
    search?: string;
  } = {},
): Promise<PurchaseOrdersPage> {
  const PAGE_SIZE = 20;
  const page      = Math.max(1, opts.page ?? 1);

  const where = {
    salonId,
    organizationId,
    isActive: true,
    ...(opts.status     ? { status: opts.status }           : {}),
    ...(opts.supplierId ? { supplierId: opts.supplierId }   : {}),
    ...(opts.search
      ? {
          OR: [
            { reference: { contains: opts.search, mode: "insensitive" as const } },
            { supplier:  { name: { contains: opts.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.purchaseOrder.count({ where }),
    prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      select: {
        id:          true,
        supplierId:  true,
        status:      true,
        reference:   true,
        expectedAt:  true,
        createdAt:   true,
        supplier:    { select: { name: true } },
        _count:      { select: { lines: { where: { isActive: true } } } },
        lines: {
          where:  { isActive: true },
          select: { quantityOrdered: true, unitCostCents: true },
        },
      },
    }),
  ]);

  const summaries: PurchaseOrderSummary[] = orders.map((o) => ({
    id:                o.id,
    supplierId:        o.supplierId,
    supplierName:      o.supplier.name,
    status:            o.status,
    reference:         o.reference,
    lineCount:         o._count.lines,
    totalOrderedCents: o.lines.reduce((s, l) => s + l.quantityOrdered * l.unitCostCents, 0),
    expectedAt:        o.expectedAt,
    createdAt:         o.createdAt,
  }));

  return { orders: summaries, total, page, pageSize: PAGE_SIZE };
}

export async function getPurchaseOrder(
  id: string,
  salonId: string,
  organizationId: string,
): Promise<PurchaseOrderView | null> {
  const order = await prisma.purchaseOrder.findFirst({
    where: { id, salonId, organizationId, isActive: true },
    include: {
      supplier:  { select: { name: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      lines: {
        where:   { isActive: true },
        orderBy: { createdAt: "asc" },
        include: {
          product:     { select: { name: true, unit: true } },
          receiptLines: { select: { quantityReceived: true } },
        },
      },
      receipts: {
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { firstName: true, lastName: true } },
          lines: {
            include: { product: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!order) return null;

  const lineViews: PurchaseOrderLineView[] = order.lines.map((l) => {
    const qtyReceived  = l.receiptLines.reduce((s, r) => s + r.quantityReceived, 0);
    return {
      id:                l.id,
      purchaseOrderId:   l.purchaseOrderId,
      productId:         l.productId,
      productName:       l.product.name,
      productUnit:       l.product.unit,
      quantityOrdered:   l.quantityOrdered,
      quantityReceived:  qtyReceived,
      quantityRemaining: l.quantityOrdered - qtyReceived,
      unitCostCents:     l.unitCostCents,
      totalCostCents:    l.quantityOrdered * l.unitCostCents,
      notes:             l.notes,
    };
  });

  const receiptViews: PurchaseOrderReceiptView[] = order.receipts.map((r) => {
    const receiptLines: PurchaseOrderReceiptLineView[] = r.lines.map((rl) => ({
      id:                  rl.id,
      receiptId:           rl.receiptId,
      purchaseOrderLineId: rl.purchaseOrderLineId,
      productId:           rl.productId,
      productName:         rl.product.name,
      quantityReceived:    rl.quantityReceived,
      unitCostCents:       rl.unitCostCents,
      totalCostCents:      rl.totalCostCents,
    }));
    return {
      id:              r.id,
      purchaseOrderId: r.purchaseOrderId,
      receivedAt:      r.receivedAt,
      notes:           r.notes,
      createdByName:   r.createdBy
        ? `${r.createdBy.firstName} ${r.createdBy.lastName}`.trim()
        : null,
      lines:     receiptLines,
      createdAt: r.createdAt,
    };
  });

  return {
    id:                order.id,
    salonId:           order.salonId,
    organizationId:    order.organizationId,
    supplierId:        order.supplierId,
    supplierName:      order.supplier.name,
    status:            order.status,
    reference:         order.reference,
    expectedAt:        order.expectedAt,
    notes:             order.notes,
    isActive:          order.isActive,
    lines:             lineViews,
    receipts:          receiptViews,
    totalOrderedCents: lineViews.reduce((s, l) => s + l.totalCostCents, 0),
    createdByName:     order.createdBy
      ? `${order.createdBy.firstName} ${order.createdBy.lastName}`.trim()
      : null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createPurchaseOrder(
  data: CreatePurchaseOrderData,
  proUserId: string,
): Promise<{ id: string }> {
  const supplier = await prisma.supplier.findFirst({
    where:  { id: data.supplierId, salonId: data.salonId, organizationId: data.organizationId, isActive: true },
    select: { id: true },
  });
  if (!supplier) throw new Error("Fournisseur introuvable ou inactif.");

  const order = await prisma.purchaseOrder.create({
    data: {
      salonId:            data.salonId,
      organizationId:     data.organizationId,
      supplierId:         data.supplierId,
      reference:          data.reference   || null,
      expectedAt:         data.expectedAt  ? new Date(data.expectedAt) : null,
      notes:              data.notes       || null,
      createdByProUserId: proUserId,
    },
    select: { id: true },
  });
  return order;
}

export async function addOrderLine(
  data: AddPurchaseOrderLineData,
): Promise<{ id: string }> {
  const order = await prisma.purchaseOrder.findFirst({
    where:  { id: data.purchaseOrderId, salonId: data.salonId, organizationId: data.organizationId, isActive: true, status: "DRAFT" },
    select: { id: true },
  });
  if (!order) throw new Error("Bon de commande introuvable ou non modifiable (statut non DRAFT).");

  const product = await prisma.product.findFirst({
    where:  { id: data.productId, salonId: data.salonId, organizationId: data.organizationId, isActive: true },
    select: { id: true },
  });
  if (!product) throw new Error("Produit introuvable ou inactif.");

  const line = await prisma.purchaseOrderLine.create({
    data: {
      salonId:         data.salonId,
      organizationId:  data.organizationId,
      purchaseOrderId: data.purchaseOrderId,
      productId:       data.productId,
      quantityOrdered: data.quantityOrdered,
      unitCostCents:   data.unitCostCents,
      notes:           data.notes || null,
    },
    select: { id: true },
  });
  return line;
}

export async function removeOrderLine(
  lineId: string,
  orderId: string,
  salonId: string,
  organizationId: string,
): Promise<void> {
  const order = await prisma.purchaseOrder.findFirst({
    where:  { id: orderId, salonId, organizationId, isActive: true, status: "DRAFT" },
    select: { id: true },
  });
  if (!order) throw new Error("Bon de commande introuvable ou non modifiable.");

  const line = await prisma.purchaseOrderLine.findFirst({
    where:  { id: lineId, purchaseOrderId: orderId, salonId, organizationId },
    select: { id: true },
  });
  if (!line) throw new Error("Ligne introuvable.");

  await prisma.purchaseOrderLine.update({
    where: { id: lineId },
    data:  { isActive: false },
  });
}

export async function sendPurchaseOrder(
  id: string,
  salonId: string,
  organizationId: string,
): Promise<void> {
  const order = await prisma.purchaseOrder.findFirst({
    where:  { id, salonId, organizationId, isActive: true },
    select: { id: true, status: true, _count: { select: { lines: { where: { isActive: true } } } } },
  });
  if (!order) throw new Error("Bon de commande introuvable.");
  if (order.status !== "DRAFT") throw new Error(`Impossible d'envoyer : statut actuel "${order.status}".`);
  if (order._count.lines === 0) throw new Error("Le bon de commande doit avoir au moins une ligne.");

  await prisma.purchaseOrder.update({
    where: { id },
    data:  { status: "SENT" },
  });
}

export async function cancelPurchaseOrder(
  id: string,
  salonId: string,
  organizationId: string,
): Promise<void> {
  const order = await prisma.purchaseOrder.findFirst({
    where:  { id, salonId, organizationId, isActive: true },
    select: { id: true, status: true },
  });
  if (!order) throw new Error("Bon de commande introuvable.");
  if (order.status !== "DRAFT" && order.status !== "SENT") {
    throw new Error(`Annulation impossible : statut actuel "${order.status}".`);
  }

  await prisma.purchaseOrder.update({
    where: { id },
    data:  { status: "CANCELLED" },
  });
}
