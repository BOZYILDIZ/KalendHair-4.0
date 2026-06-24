import { prisma } from "@/lib/db/prisma";
import type { SupplierView, SupplierSummary, SuppliersPage } from "./types";
import type { CreateSupplierData, UpdateSupplierData } from "./supplier.schema";

const SUPPLIER_SELECT = {
  id:             true,
  salonId:        true,
  organizationId: true,
  name:           true,
  contactName:    true,
  email:          true,
  phone:          true,
  address:        true,
  notes:          true,
  isActive:       true,
  createdAt:      true,
  updatedAt:      true,
} as const;

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSuppliers(
  salonId: string,
  organizationId: string,
  opts: { page?: number; search?: string; activeOnly?: boolean } = {},
): Promise<SuppliersPage> {
  const PAGE_SIZE = 20;
  const page      = Math.max(1, opts.page ?? 1);

  const where = {
    salonId,
    organizationId,
    isActive: opts.activeOnly ? true : undefined,
    ...(opts.search
      ? { name: { contains: opts.search, mode: "insensitive" as const } }
      : {}),
  };

  const [total, suppliers] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      orderBy: { name: "asc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      select:  SUPPLIER_SELECT,
    }),
  ]);

  return { suppliers: suppliers as SupplierView[], total, page, pageSize: PAGE_SIZE };
}

export async function getSupplierSummaries(
  salonId: string,
  organizationId: string,
): Promise<SupplierSummary[]> {
  return prisma.supplier.findMany({
    where:   { salonId, organizationId, isActive: true },
    orderBy: { name: "asc" },
    select:  { id: true, name: true, isActive: true },
  });
}

export async function getSupplier(
  id: string,
  salonId: string,
  organizationId: string,
): Promise<SupplierView | null> {
  return prisma.supplier.findFirst({
    where:  { id, salonId, organizationId },
    select: SUPPLIER_SELECT,
  }) as Promise<SupplierView | null>;
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createSupplier(data: CreateSupplierData): Promise<{ id: string }> {
  const existing = await prisma.supplier.findFirst({
    where:  { salonId: data.salonId, name: data.name, isActive: true },
    select: { id: true },
  });
  if (existing) throw new Error(`Un fournisseur nommé "${data.name}" existe déjà.`);

  const supplier = await prisma.supplier.create({
    data: {
      salonId:        data.salonId,
      organizationId: data.organizationId,
      name:           data.name,
      contactName:    data.contactName || null,
      email:          data.email       || null,
      phone:          data.phone       || null,
      address:        data.address     || null,
      notes:          data.notes       || null,
    },
    select: { id: true },
  });
  return supplier;
}

export async function updateSupplier(
  id: string,
  data: UpdateSupplierData,
): Promise<void> {
  const supplier = await prisma.supplier.findFirst({
    where:  { id, salonId: data.salonId, organizationId: data.organizationId },
    select: { id: true },
  });
  if (!supplier) throw new Error("Fournisseur introuvable.");

  const duplicate = await prisma.supplier.findFirst({
    where:  { salonId: data.salonId, name: data.name, NOT: { id } },
    select: { id: true },
  });
  if (duplicate) throw new Error(`Un fournisseur nommé "${data.name}" existe déjà.`);

  await prisma.supplier.update({
    where: { id },
    data:  {
      name:        data.name,
      contactName: data.contactName || null,
      email:       data.email       || null,
      phone:       data.phone       || null,
      address:     data.address     || null,
      notes:       data.notes       || null,
    },
  });
}

export async function deactivateSupplier(
  id: string,
  salonId: string,
  organizationId: string,
): Promise<void> {
  const supplier = await prisma.supplier.findFirst({
    where:  { id, salonId, organizationId },
    select: { id: true },
  });
  if (!supplier) throw new Error("Fournisseur introuvable.");

  const openOrders = await prisma.purchaseOrder.count({
    where: {
      supplierId:     id,
      salonId,
      organizationId,
      isActive:       true,
      status:         { in: ["DRAFT", "SENT"] },
    },
  });
  if (openOrders > 0) {
    throw new Error(
      `Impossible de désactiver : ${openOrders} bon(s) de commande ouvert(s).`,
    );
  }

  await prisma.supplier.update({
    where: { id },
    data:  { isActive: false },
  });
}
