import { z } from "zod";

export const UpdateSalonSchema = z.object({
  name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(100, "Maximum 100 caractères")
    .trim(),
  description: z.string().max(500, "Maximum 500 caractères").trim(),
  phone: z.string().max(20, "Maximum 20 caractères").trim(),
  email: z.string().refine(
    (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    "Email invalide",
  ),
  address: z.string().max(200, "Maximum 200 caractères").trim(),
  city: z.string().max(100, "Maximum 100 caractères").trim(),
  postalCode: z.string().max(10, "Maximum 10 caractères").trim(),
  timezone: z.string().refine(
    (val) => val === "" || /^[A-Za-z_]+\/[A-Za-z_/]+$/.test(val),
    "Format IANA attendu (ex: Europe/Paris)",
  ),
});

export type UpdateSalonInput = z.infer<typeof UpdateSalonSchema>;
