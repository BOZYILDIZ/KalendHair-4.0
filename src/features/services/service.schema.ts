import { z } from "zod";

export const CreateServiceSchema = z.object({
  name: z.string().min(1, "Requis").max(100, "Maximum 100 caractères").trim(),
  description: z
    .string()
    .max(500, "Maximum 500 caractères")
    .trim()
    .optional(),
  durationMinutes: z.coerce
    .number()
    .int("Entier requis")
    .positive("Doit être positif")
    .max(480, "Maximum 480 minutes"),
  price: z.coerce
    .number()
    .min(0, "Doit être positif ou nul")
    .max(10000, "Maximum 10 000 €"),
});

export const UpdateServiceSchema = CreateServiceSchema;

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
