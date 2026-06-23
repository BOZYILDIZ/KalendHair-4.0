import { z } from "zod";

// totalCents absent intentionnellement — calculé par le service (unitPriceCents * quantity)
export const CreatePaymentLineSchema = z.object({
  label:          z.string().min(1, "Le libellé est requis").max(200),
  unitPriceCents: z.number().int().min(1, "Le prix unitaire doit être supérieur à 0"),
  quantity:       z.number().int().min(1, "La quantité doit être au moins 1"),
  serviceId:      z.string().cuid().optional(),
});

// Méthodes exposées dans le formulaire (OTHER exclu en Sprint 14)
const FormPaymentMethodSchema = z.enum(["CASH", "CARD", "TRANSFER"]);

const PaidAtSchema = z
  .string()
  .min(1, "La date est requise")
  .refine(
    (v) => {
      const d = new Date(v);
      return !isNaN(d.getTime()) && d <= new Date();
    },
    { message: "La date ne peut pas être dans le futur" },
  );

export const CreateAppointmentPaymentSchema = z.object({
  amountCents: z.number().int().min(1, "Le montant doit être supérieur à 0"),
  method:      FormPaymentMethodSchema,
  paidAt:      PaidAtSchema,
  notes:       z.string().max(500).optional(),
});

export const CreateFreePaymentSchema = z.object({
  amountCents: z.number().int().min(1, "Le montant doit être supérieur à 0"),
  method:      FormPaymentMethodSchema,
  paidAt:      PaidAtSchema,
  notes:       z.string().max(500).optional(),
  guestName:   z.string().max(200).optional(),
  clientId:    z.string().cuid().optional(),
  line:        CreatePaymentLineSchema,
});

export const CancelPaymentSchema = z.object({
  paymentId: z.string().cuid(),
});

export type CreateAppointmentPaymentData = z.infer<typeof CreateAppointmentPaymentSchema>;
export type CreateFreePaymentData        = z.infer<typeof CreateFreePaymentSchema>;
export type CancelPaymentData            = z.infer<typeof CancelPaymentSchema>;
