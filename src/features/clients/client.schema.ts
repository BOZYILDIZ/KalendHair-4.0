import { z } from "zod";

export const UpdateNotesSchema = z.object({
  notes: z.string().max(500, "Les notes ne peuvent pas dépasser 500 caractères").nullable(),
});

export type UpdateNotesInput = z.infer<typeof UpdateNotesSchema>;
