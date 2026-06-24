import { z } from "zod";

const reason = z
  .string()
  .min(10, "La raison doit comporter au moins 10 caractères.");

export const ChangePlanSchema = z.object({
  planCode: z.enum(["ESSENTIAL", "PRO", "BUSINESS"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  reason,
});

export const GrantFreePlanSchema = z.object({ reason });

export const RevokeFreePlanSchema = z.object({ reason });

export const CreateDiscountSchema = z
  .object({
    type: z.enum(["PERCENT", "FIXED_AMOUNT"]),
    value: z.coerce.number().int().positive("La valeur doit être positive."),
    reason,
    startDate: z.string().min(1, "La date de début est obligatoire."),
    endDate: z.string().optional(),
  })
  .refine(
    (d) => {
      if (!d.endDate) return true;
      return new Date(d.endDate) > new Date(d.startDate);
    },
    { message: "La date de fin doit être postérieure à la date de début." },
  )
  .refine(
    (d) => {
      if (d.type === "PERCENT") return d.value <= 100;
      return true;
    },
    { message: "Le pourcentage ne peut pas dépasser 100." },
  );

export const DeactivateDiscountSchema = z.object({
  discountId: z.string().min(1),
  reason,
});

export const SuspendSchema = z.object({ reason });

export const ReactivateSchema = z.object({ reason });

export const ExtendTrialSchema = z.object({
  newTrialEndsAt: z
    .string()
    .min(1, "La date de fin d'essai est obligatoire.")
    .refine((d) => new Date(d) > new Date(), {
      message: "La date doit être dans le futur.",
    }),
  reason,
});

export const AddNoteSchema = z.object({
  content: z.string().min(1, "Le contenu de la note est obligatoire."),
});

export const AdminLoginSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(1, "Mot de passe obligatoire."),
});

export type ChangePlanData = z.infer<typeof ChangePlanSchema>;
export type CreateDiscountData = z.infer<typeof CreateDiscountSchema>;
