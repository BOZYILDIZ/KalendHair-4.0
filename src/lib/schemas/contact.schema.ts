import { z } from "zod";

export const EMPLOYEE_COUNT_VALUES = [
  "1",
  "2-3",
  "4-5",
  "6-10",
  "10+",
] as const;

export const MODULE_VALUES = [
  "agenda",
  "reservation",
  "crm",
  "caisse",
  "stocks",
  "fournisseurs",
  "commissions",
  "kpi",
] as const;

export const contactSchema = z.object({
  salonName: z
    .string()
    .min(2, "Le nom du salon est requis (min. 2 caractères)")
    .max(100, "100 caractères maximum"),
  firstName: z
    .string()
    .min(2, "Le prénom est requis (min. 2 caractères)")
    .max(50),
  lastName: z
    .string()
    .min(2, "Le nom est requis (min. 2 caractères)")
    .max(50),
  email: z
    .string()
    .email("Adresse e-mail invalide")
    .max(200),
  phone: z.string().max(20).optional(),
  city: z
    .string()
    .min(2, "La ville est requise")
    .max(100),
  employeeCount: z.enum(EMPLOYEE_COUNT_VALUES, {
    error: "Veuillez sélectionner une option",
  }),
  modules: z
    .array(z.string())
    .min(1, "Sélectionnez au moins un module"),
  message: z.string().max(2000, "Le message ne peut pas dépasser 2000 caractères").optional(),
  gdprConsent: z
    .boolean()
    .refine((val) => val === true, {
      message: "Le consentement est requis pour envoyer votre demande.",
    }),
});

export type ContactInput = z.infer<typeof contactSchema>;
