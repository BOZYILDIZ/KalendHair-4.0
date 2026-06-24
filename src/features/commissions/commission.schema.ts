import { z } from "zod";

export const CreateCommissionRuleSchema = z
  .object({
    employeeId: z.string().optional(),
    serviceId:  z.string().optional(),
    productId:  z.string().optional(),
    type:       z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value:      z.coerce.number().int().positive("La valeur doit être un entier positif."),
  })
  .refine(
    (d) => !(d.serviceId && d.productId),
    { message: "Une règle ne peut pas cibler simultanément une prestation et un produit." },
  )
  .refine(
    (d) => d.type !== "PERCENTAGE" || (d.value >= 1 && d.value <= 100),
    { message: "Le pourcentage doit être compris entre 1 et 100." },
  );

export const UpdateCommissionRuleSchema = z
  .object({
    ruleId: z.string().min(1, "ID de règle manquant."),
    type:   z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value:  z.coerce.number().int().positive("La valeur doit être un entier positif."),
  })
  .refine(
    (d) => d.type !== "PERCENTAGE" || (d.value >= 1 && d.value <= 100),
    { message: "Le pourcentage doit être compris entre 1 et 100." },
  );

export const DeactivateCommissionRuleSchema = z.object({
  ruleId: z.string().min(1, "ID de règle manquant."),
});

export const AdjustCommissionSchema = z.object({
  entryId:    z.string().min(1, "ID d'entrée manquant."),
  deltaCents: z.coerce
    .number()
    .int()
    .min(-1_000_000, "Correction trop grande.")
    .max(1_000_000, "Bonus trop grand.")
    .refine((v) => v !== 0, { message: "L'ajustement ne peut pas être zéro." }),
  reason: z.string().min(10, "La raison doit comporter au moins 10 caractères."),
});

export type CreateCommissionRuleData = z.infer<typeof CreateCommissionRuleSchema>;
export type UpdateCommissionRuleData = z.infer<typeof UpdateCommissionRuleSchema>;
export type AdjustCommissionData     = z.infer<typeof AdjustCommissionSchema>;
