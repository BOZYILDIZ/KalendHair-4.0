import { z } from "zod";

export const UpdateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(100, "Maximum 100 caractères")
    .trim(),
});

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
