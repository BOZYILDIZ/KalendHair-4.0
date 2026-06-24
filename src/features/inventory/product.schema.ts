import { z } from "zod";

export const CreateProductCategorySchema = z.object({
  salonId:        z.string().min(1),
  organizationId: z.string().min(1),
  name:           z.string().min(1).max(100),
});
export type CreateProductCategoryData = z.infer<typeof CreateProductCategorySchema>;

export const CreateProductSchema = z.object({
  salonId:           z.string().min(1),
  organizationId:    z.string().min(1),
  categoryId:        z.string().min(1).optional(),
  name:              z.string().min(1).max(200),
  description:       z.string().max(1000).optional(),
  unit:              z.string().min(1).max(50).default("unité"),
  priceCents:        z.number().int().min(0),
  costPriceCents:    z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).default(5),
});
export type CreateProductData = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  categoryId:        z.string().min(1).nullable().optional(),
  name:              z.string().min(1).max(200).optional(),
  description:       z.string().max(1000).nullable().optional(),
  unit:              z.string().min(1).max(50).optional(),
  priceCents:        z.number().int().min(0).optional(),
  costPriceCents:    z.number().int().min(0).nullable().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
});
export type UpdateProductData = z.infer<typeof UpdateProductSchema>;

export const RecordEntrySchema = z.object({
  productId:      z.string().min(1),
  salonId:        z.string().min(1),
  organizationId: z.string().min(1),
  quantity:       z.number().int().min(1),
  costPriceCents: z.number().int().min(0).optional(),
  notes:          z.string().max(500).optional(),
});
export type RecordEntryData = z.infer<typeof RecordEntrySchema>;

export const RecordUsageSchema = z.object({
  productId:      z.string().min(1),
  salonId:        z.string().min(1),
  organizationId: z.string().min(1),
  quantity:       z.number().int().min(1),
  notes:          z.string().max(500).optional(),
  referenceId:    z.string().optional(),
});
export type RecordUsageData = z.infer<typeof RecordUsageSchema>;

export const AdjustStockSchema = z.object({
  productId:      z.string().min(1),
  salonId:        z.string().min(1),
  organizationId: z.string().min(1),
  newQuantity:    z.number().int().min(0),
  notes:          z.string().max(500).optional(),
});
export type AdjustStockData = z.infer<typeof AdjustStockSchema>;

export const SellProductSchema = z.object({
  productId:      z.string().min(1),
  salonId:        z.string().min(1),
  organizationId: z.string().min(1),
  quantity:       z.number().int().min(1),
  method:         z.enum(["CASH", "CARD", "TRANSFER", "CHECK", "OTHER"]),
  notes:          z.string().max(500).optional(),
  clientId:       z.string().optional(),
  guestName:      z.string().max(200).optional(),
});
export type SellProductData = z.infer<typeof SellProductSchema>;
