import { prisma } from "@/lib/db/prisma";
import type {
  ProductView,
  ProductSummary,
  ProductCategoryView,
  ProductsPage,
} from "./types";
import type {
  CreateProductData,
  CreateProductCategoryData,
  UpdateProductData,
} from "./product.schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type RawProduct = {
  id:                string;
  salonId:           string;
  organizationId:    string;
  categoryId:        string | null;
  name:              string;
  description:       string | null;
  unit:              string;
  priceCents:        number;
  costPriceCents:    number | null;
  lowStockThreshold: number;
  isActive:          boolean;
  createdAt:         Date;
  updatedAt:         Date;
  category:          { name: string } | null;
  stock:             { quantity: number } | null;
};

function toProductView(raw: RawProduct): ProductView {
  return {
    id:                raw.id,
    salonId:           raw.salonId,
    organizationId:    raw.organizationId,
    categoryId:        raw.categoryId,
    categoryName:      raw.category?.name ?? null,
    name:              raw.name,
    description:       raw.description,
    unit:              raw.unit,
    priceCents:        raw.priceCents,
    costPriceCents:    raw.costPriceCents,
    lowStockThreshold: raw.lowStockThreshold,
    isActive:          raw.isActive,
    currentStock:      raw.stock?.quantity ?? null,
    createdAt:         raw.createdAt,
    updatedAt:         raw.updatedAt,
  };
}

const PRODUCT_SELECT = {
  id:                true,
  salonId:           true,
  organizationId:    true,
  categoryId:        true,
  name:              true,
  description:       true,
  unit:              true,
  priceCents:        true,
  costPriceCents:    true,
  lowStockThreshold: true,
  isActive:          true,
  createdAt:         true,
  updatedAt:         true,
  category: { select: { name: true } },
  stock:    { select: { quantity: true } },
} as const;

// ─── Categories ───────────────────────────────────────────────────────────────

export async function createProductCategory(
  data: CreateProductCategoryData,
): Promise<ProductCategoryView> {
  const cat = await prisma.productCategory.create({
    data: {
      salonId:        data.salonId,
      organizationId: data.organizationId,
      name:           data.name,
    },
    select: { id: true, name: true, isActive: true },
  });
  return cat;
}

export async function getProductCategories(
  salonId: string,
  organizationId: string,
): Promise<ProductCategoryView[]> {
  return prisma.productCategory.findMany({
    where:   { salonId, organizationId, isActive: true },
    orderBy: { name: "asc" },
    select:  { id: true, name: true, isActive: true },
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(data: CreateProductData): Promise<ProductView> {
  const product = await prisma.product.create({
    data: {
      salonId:           data.salonId,
      organizationId:    data.organizationId,
      categoryId:        data.categoryId ?? null,
      name:              data.name,
      description:       data.description ?? null,
      unit:              data.unit,
      priceCents:        data.priceCents,
      costPriceCents:    data.costPriceCents ?? null,
      lowStockThreshold: data.lowStockThreshold,
    },
    select: PRODUCT_SELECT,
  });
  return toProductView(product as unknown as RawProduct);
}

export async function getProduct(
  id: string,
  salonId: string,
  organizationId: string,
): Promise<ProductView | null> {
  const product = await prisma.product.findFirst({
    where:  { id, salonId, organizationId },
    select: PRODUCT_SELECT,
  });
  if (!product) return null;
  return toProductView(product as unknown as RawProduct);
}

export async function updateProduct(
  id: string,
  salonId: string,
  organizationId: string,
  data: UpdateProductData,
): Promise<ProductView> {
  const existing = await prisma.product.findFirst({
    where:  { id, salonId, organizationId },
    select: { id: true },
  });
  if (!existing) throw new Error("Produit introuvable.");

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name              !== undefined && { name: data.name }),
      ...(data.description       !== undefined && { description: data.description }),
      ...(data.unit              !== undefined && { unit: data.unit }),
      ...(data.priceCents        !== undefined && { priceCents: data.priceCents }),
      ...(data.costPriceCents    !== undefined && { costPriceCents: data.costPriceCents }),
      ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
      ...(data.categoryId        !== undefined && { categoryId: data.categoryId }),
    },
    select: PRODUCT_SELECT,
  });
  return toProductView(product as unknown as RawProduct);
}

export async function deactivateProduct(
  id: string,
  salonId: string,
  organizationId: string,
): Promise<void> {
  const existing = await prisma.product.findFirst({
    where:  { id, salonId, organizationId },
    select: { id: true },
  });
  if (!existing) throw new Error("Produit introuvable.");

  const stock = await prisma.productStock.findUnique({
    where:  { productId: id },
    select: { quantity: true },
  });
  if (stock && stock.quantity > 0) {
    throw new Error(
      `Ce produit a encore ${stock.quantity} unité(s) en stock. Remettez le stock à 0 avant de le désactiver.`,
    );
  }

  await prisma.product.update({
    where: { id },
    data:  { isActive: false },
  });
}

export async function getProductSummaries(
  salonId: string,
  organizationId: string,
): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where:   { salonId, organizationId, isActive: true },
    orderBy: { name: "asc" },
    select: {
      id:           true,
      name:         true,
      unit:         true,
      priceCents:   true,
      isActive:     true,
      stock:        { select: { quantity: true } },
    },
  });
  return products.map((p) => ({
    id:           p.id,
    name:         p.name,
    unit:         p.unit,
    priceCents:   p.priceCents,
    isActive:     p.isActive,
    currentStock: p.stock?.quantity ?? null,
  }));
}

export async function getProducts(
  salonId: string,
  organizationId: string,
  opts: { page?: number; includeInactive?: boolean } = {},
): Promise<ProductsPage> {
  const PAGE_SIZE = 20;
  const page      = Math.max(1, opts.page ?? 1);

  const where = {
    salonId,
    organizationId,
    ...(opts.includeInactive ? {} : { isActive: true }),
  };

  const [total, rawItems] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      select:  PRODUCT_SELECT,
    }),
  ]);

  return {
    products: (rawItems as unknown as RawProduct[]).map(toProductView),
    total,
    page,
    pageSize: PAGE_SIZE,
  };
}
