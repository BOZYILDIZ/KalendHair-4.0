import { z } from "zod";

export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1, "Requis").max(50, "Maximum 50 caractères").trim(),
  lastName: z.string().min(1, "Requis").max(50, "Maximum 50 caractères").trim(),
  email: z
    .string()
    .refine(
      (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Email invalide",
    )
    .optional(),
  phone: z.string().max(20, "Maximum 20 caractères").trim().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format hex attendu (ex: #FF5733)")
    .optional()
    .or(z.literal("")),
});

export const UpdateEmployeeSchema = CreateEmployeeSchema;

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
