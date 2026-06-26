import { z } from "zod";

const VALID_PLANS = ["ESSENTIAL", "PRO", "BUSINESS"] as const;

export const OnboardingFormSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(100, "100 caractères maximum")
    .trim(),
  salonName: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(100, "100 caractères maximum")
    .trim(),
  city: z
    .string()
    .min(1, "La ville est requise")
    .max(100, "100 caractères maximum")
    .trim(),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Code postal à 5 chiffres (ex : 75001)")
    .trim(),
  address: z.string().max(200, "200 caractères maximum").trim().optional(),
  phone: z.string().max(20, "20 caractères maximum").trim().optional(),
  planCode: z.enum(VALID_PLANS, {
    message: "Plan invalide. Choisissez ESSENTIAL, PRO ou BUSINESS.",
  }),
});

export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>;
