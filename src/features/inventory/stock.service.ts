import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { getNextReceiptNumber } from "@/features/payments/receipt.service";
import type {
  StockMovementView,
  LowStockProduct,
  InventoryDashboard,
  StockMovementsPage,
} from "./types";
import type {
  RecordEntryData,
  RecordUsageData,
  AdjustStockData,
  SellProductData,
} from "./product.schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type RawMovement = {
  id:                 string;
  productId:          string;
  type:               string;
  quantityDelta:      number;
  quantityBefore:     number;
  quantityAfter:      number;
  costPriceCents:     number | null;
  notes:              string | null;
  referenceId:        string | null;
  referenceType:      string | null;
  createdAt:          Date;
  product:            { name: string };
  createdBy:          { firstName: string; lastName: string } | null;
};

function toMovementView(raw: RawMovement): StockMovementView {
  return {
    id:              raw.id,
    productId:       raw.productId,
    productName:     raw.product.name,
    type:            raw.type as StockMovementView["type"],
    quantityDelta:   raw.quantityDelta,
    quantityBefore:  raw.quantityBefore,
    quantityAfter:   raw.quantityAfter,
    costPriceCents:  raw.costPriceCents,
    notes:           raw.notes,
    referenceId:     raw.referenceId,
    referenceType:   raw.referenceType,
    createdByName:   raw.createdBy
      ? `${raw.createdBy.firstName} ${raw.createdBy.lastName}`.trim()
      : null,
    createdAt:       raw.createdAt,
  };
}

const MOVEMENT_SELECT = {
  id:                 true,
  productId:          true,
  type:               true,
  quantityDelta:      true,
  quantityBefore:     true,
  quantityAfter:      true,
  costPriceCents:     true,
  notes:              true,
  referenceId:        true,
  referenceType:      true,
  createdAt:          true,
  product:  { select: { name: true } },
  createdBy: { select: { firstName: true, lastName: true } },
} as const;

// ─── Internal: stock guard ────────────────────────────────────────────────────

async function assertSufficientStock(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
): Promise<number> {
  const stock = await tx.productStock.findUnique({
    where:  { productId },
    select: { quantity: true },
  });
  const current = stock?.quantity ?? 0;
  if (current < quantity) {
    throw new Error(
      `Stock insuffisant : ${current} disponible(s), ${quantity} demandé(s).`,
    );
  }
  return current;
}

// ─── Internal: apply movement atomically ─────────────────────────────────────

async function applyStockMovement(
  tx: Prisma.TransactionClient,
  opts: {
    salonId:            string;
    organizationId:     string;
    productId:          string;
    type:               "ENTRY" | "SALE" | "USAGE" | "ADJUSTMENT";
    quantityDelta:      number;
    quantityBefore:     number;
    costPriceCents?:    number;
    notes?:             string;
    referenceId?:       string;
    referenceType?:     string;
    createdByProUserId?: string;
  },
): Promise<void> {
  const quantityAfter = opts.quantityBefore + opts.quantityDelta;

  await tx.productStock.upsert({
    where:  { productId: opts.productId },
    create: {
      salonId:   opts.salonId,
      productId: opts.productId,
      quantity:  quantityAfter,
    },
    update: { quantity: { increment: opts.quantityDelta } },
  });

  await tx.stockMovement.create({
    data: {
      salonId:            opts.salonId,
      organizationId:     opts.organizationId,
      productId:          opts.productId,
      type:               opts.type as never,
      quantityDelta:      opts.quantityDelta,
      quantityBefore:     opts.quantityBefore,
      quantityAfter,
      costPriceCents:     opts.costPriceCents ?? null,
      notes:              opts.notes ?? null,
      referenceId:        opts.referenceId ?? null,
      referenceType:      opts.referenceType ?? null,
      createdByProUserId: opts.createdByProUserId ?? null,
    },
  });
}

// ─── Public: entrée stock ─────────────────────────────────────────────────────

export async function recordEntry(
  data: RecordEntryData,
  proUserId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const stock = await tx.productStock.findUnique({
      where:  { productId: data.productId },
      select: { quantity: true },
    });
    const quantityBefore = stock?.quantity ?? 0;

    await applyStockMovement(tx, {
      salonId:            data.salonId,
      organizationId:     data.organizationId,
      productId:          data.productId,
      type:               "ENTRY",
      quantityDelta:      data.quantity,
      quantityBefore,
      costPriceCents:     data.costPriceCents,
      notes:              data.notes,
      createdByProUserId: proUserId,
    });
  });
}

// ─── Public: déduction stock pour une vente (appelé dans tx POS) ──────────────

export async function deductStockForSale(
  tx: Prisma.TransactionClient,
  opts: {
    salonId:            string;
    organizationId:     string;
    productId:          string;
    quantity:           number;
    paymentId:          string;
    createdByProUserId?: string;
  },
): Promise<void> {
  const quantityBefore = await assertSufficientStock(tx, opts.productId, opts.quantity);

  await applyStockMovement(tx, {
    salonId:            opts.salonId,
    organizationId:     opts.organizationId,
    productId:          opts.productId,
    type:               "SALE",
    quantityDelta:      -opts.quantity,
    quantityBefore,
    referenceId:        opts.paymentId,
    referenceType:      "payment",
    createdByProUserId: opts.createdByProUserId,
  });
}

// ─── Public: vente produit (crée le paiement + déduction stock) ───────────────

export async function createProductSalePayment(
  data: SellProductData,
  proUserId: string,
): Promise<{ paymentId: string }> {
  const product = await prisma.product.findFirst({
    where:  { id: data.productId, salonId: data.salonId, organizationId: data.organizationId, isActive: true },
    select: { name: true, priceCents: true },
  });
  if (!product) throw new Error("Produit introuvable ou inactif.");

  const paidAt = new Date();
  const year   = paidAt.getUTCFullYear();
  const totalCents = product.priceCents * data.quantity;

  const result = await prisma.$transaction(async (tx) => {
    const receiptNumber = await getNextReceiptNumber(tx, data.salonId, year);

    const payment = await tx.payment.create({
      data: {
        organizationId:     data.organizationId,
        salonId:            data.salonId,
        clientId:           data.clientId ?? null,
        guestName:          data.guestName ?? null,
        method:             data.method as never,
        status:             "COMPLETED" as never,
        amountCents:        totalCents,
        paidAt,
        receiptNumber,
        notes:              data.notes ?? null,
        createdByProUserId: proUserId,
      },
      select: { id: true },
    });

    await tx.paymentLine.create({
      data: {
        paymentId:      payment.id,
        label:          product.name,
        unitPriceCents: product.priceCents,
        quantity:       data.quantity,
        totalCents,
      },
    });

    await deductStockForSale(tx, {
      salonId:            data.salonId,
      organizationId:     data.organizationId,
      productId:          data.productId,
      quantity:           data.quantity,
      paymentId:          payment.id,
      createdByProUserId: proUserId,
    });

    return payment;
  });

  return { paymentId: result.id };
}

// ─── Public: utilisation en prestation ───────────────────────────────────────

export async function recordUsage(
  data: RecordUsageData,
  proUserId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const quantityBefore = await assertSufficientStock(tx, data.productId, data.quantity);

    await applyStockMovement(tx, {
      salonId:            data.salonId,
      organizationId:     data.organizationId,
      productId:          data.productId,
      type:               "USAGE",
      quantityDelta:      -data.quantity,
      quantityBefore,
      notes:              data.notes,
      referenceId:        data.referenceId,
      referenceType:      data.referenceId ? "appointment" : undefined,
      createdByProUserId: proUserId,
    });
  });
}

// ─── Public: ajustement inventaire ───────────────────────────────────────────

export async function adjustStock(
  data: AdjustStockData,
  proUserId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const stock = await tx.productStock.findUnique({
      where:  { productId: data.productId },
      select: { quantity: true },
    });
    const quantityBefore = stock?.quantity ?? 0;
    const quantityDelta  = data.newQuantity - quantityBefore;

    await applyStockMovement(tx, {
      salonId:            data.salonId,
      organizationId:     data.organizationId,
      productId:          data.productId,
      type:               "ADJUSTMENT",
      quantityDelta,
      quantityBefore,
      notes:              data.notes,
      createdByProUserId: proUserId,
    });
  });
}

// ─── Read: produits en rupture / alerte ──────────────────────────────────────

export async function getLowStockProducts(
  salonId: string,
  organizationId: string,
): Promise<LowStockProduct[]> {
  const products = await prisma.product.findMany({
    where:  { salonId, organizationId, isActive: true },
    select: {
      id:                true,
      name:              true,
      unit:              true,
      lowStockThreshold: true,
      stock:             { select: { quantity: true } },
    },
  });

  return products
    .filter((p) => (p.stock?.quantity ?? 0) <= p.lowStockThreshold)
    .map((p) => ({
      id:                p.id,
      name:              p.name,
      unit:              p.unit,
      currentStock:      p.stock?.quantity ?? 0,
      lowStockThreshold: p.lowStockThreshold,
    }))
    .sort((a, b) => a.currentStock - b.currentStock);
}

// ─── Read: historique mouvements paginé ──────────────────────────────────────

export async function getStockMovements(
  salonId: string,
  organizationId: string,
  opts: { page?: number; productId?: string } = {},
): Promise<StockMovementsPage> {
  const PAGE_SIZE = 20;
  const page      = Math.max(1, opts.page ?? 1);

  const where = {
    salonId,
    organizationId,
    ...(opts.productId ? { productId: opts.productId } : {}),
  };

  const [total, rawItems] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      select:  MOVEMENT_SELECT,
    }),
  ]);

  return {
    movements: (rawItems as unknown as RawMovement[]).map(toMovementView),
    total,
    page,
    pageSize: PAGE_SIZE,
  };
}

// ─── Read: dashboard inventaire ──────────────────────────────────────────────

export async function getInventoryDashboard(
  salonId: string,
  organizationId: string,
): Promise<InventoryDashboard> {
  const [products, recentRaw, lowStock] = await Promise.all([
    prisma.product.findMany({
      where:  { salonId, organizationId },
      select: {
        id:             true,
        isActive:       true,
        costPriceCents: true,
        stock:          { select: { quantity: true } },
      },
    }),
    prisma.stockMovement.findMany({
      where:   { salonId, organizationId },
      orderBy: { createdAt: "desc" },
      take:    10,
      select:  MOVEMENT_SELECT,
    }),
    getLowStockProducts(salonId, organizationId),
  ]);

  const totalProducts  = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const totalStockValue = products.reduce((sum, p) => {
    const qty  = p.stock?.quantity ?? 0;
    const cost = p.costPriceCents ?? 0;
    return sum + qty * cost;
  }, 0);

  return {
    totalProducts,
    activeProducts,
    totalStockValue,
    lowStockCount:    lowStock.length,
    lowStockProducts: lowStock,
    recentMovements:  (recentRaw as unknown as RawMovement[]).map(toMovementView),
  };
}
