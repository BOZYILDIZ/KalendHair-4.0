import { z } from "zod";

export const SalonScheduleDaySchema = z
  .object({
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    isOpen:      z.boolean(),
    startMinute: z.number().int().min(0).max(1439),
    endMinute:   z.number().int().min(0).max(1439),
  })
  .refine((d) => !d.isOpen || d.startMinute < d.endMinute, {
    message: "L'heure de fin doit être après l'heure de début",
  });

export const EmployeeScheduleDaySchema = z
  .object({
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    isWorking:   z.boolean(),
    startMinute: z.number().int().min(0).max(1439),
    endMinute:   z.number().int().min(0).max(1439),
  })
  .refine((d) => !d.isWorking || d.startMinute < d.endMinute, {
    message: "L'heure de fin doit être après l'heure de début",
  });

export const ClosedDaySchema = z.object({
  date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD attendu"),
  reason: z.string().max(200).trim().optional(),
});

export type SalonScheduleDayInput   = z.infer<typeof SalonScheduleDaySchema>;
export type EmployeeScheduleDayInput = z.infer<typeof EmployeeScheduleDaySchema>;
export type ClosedDayInput          = z.infer<typeof ClosedDaySchema>;
