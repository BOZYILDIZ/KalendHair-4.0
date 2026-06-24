import { z } from "zod";

export const CreatePurchaseOrderSchema = z.object({
  salonId:        z.string().min(1),
  organizationId: z.string().min(1),
  supplierId:     z.string().min(1, "Le fournisseur est obligatoire."),
  reference:      z.string().max(100).optional().or(z.literal("")),
  expectedAt:     z.string().optional().or(z.literal("")),
  notes:          z.string().max(1000).optional().or(z.literal("")),
});

export type CreatePurchaseOrderData = z.infer<typeof CreatePurchaseOrderSchema>;

export const AddPurchaseOrderLineSchema = z.object({
  salonId:         z.string().min(1),
  organizationId:  z.string().min(1),
  purchaseOrderId: z.string().min(1),
  productId:       z.string().min(1, "Le produit est obligatoire."),
  quantityOrdered: z.number().int().min(1, "La quantité doit être au moins 1."),
  unitCostCents:   z.number().int().min(0, "Le coût doit être positif ou nul."),
  notes:           z.string().max(500).optional().or(z.literal("")),
});

export type AddPurchaseOrderLineData = z.infer<typeof AddPurchaseOrderLineSchema>;

export const ReceiveStockSchema = z.object({
  purchaseOrderId: z.string().min(1),
  salonId:         z.string().min(1),
  organizationId:  z.string().min(1),
  notes:           z.string().max(1000).optional().or(z.literal("")),
  lines: z
    .array(
      z.object({
        purchaseOrderLineId: z.string().min(1),
        productId:           z.string().min(1),
        quantityReceived:    z.number().int().min(1),
        unitCostCents:       z.number().int().min(0),
      }),
    )
    .min(1, "Au moins une ligne doit être réceptionnée."),
});

export type ReceiveStockData = z.infer<typeof ReceiveStockSchema>;
