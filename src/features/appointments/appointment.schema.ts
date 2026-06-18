import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  employeeId: z.string().min(1, "Employé requis"),
  serviceId:  z.string().min(1, "Service requis"),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD attendu"),
  startTime:  z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM attendu"),
  guestFirstName: z.string().min(1, "Prénom requis").max(100),
  guestLastName:  z.string().min(1, "Nom requis").max(100),
  guestEmail: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim().toLowerCase() : undefined),
    z.string().email("Email invalide").optional(),
  ),
  guestPhone: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined),
    z.string().max(30).optional(),
  ),
  notes: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined),
    z.string().max(1000).optional(),
  ),
});

export const UpdateAppointmentSchema = z
  .object({
    appointmentId: z.string().min(1),
    date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    employeeId: z.string().min(1).optional(),
    notes: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() || null : undefined),
      z.string().max(1000).nullable().optional(),
    ),
  })
  .refine((d) => !d.date || !!d.startTime, {
    message: "L'heure de début est requise si une date est fournie",
    path: ["startTime"],
  })
  .refine((d) => !d.startTime || !!d.date, {
    message: "La date est requise si une heure est fournie",
    path: ["date"],
  });

export const CancelAppointmentSchema = z.object({
  appointmentId: z.string().min(1),
  reason: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined),
    z.string().max(500).optional(),
  ),
});

export const UpdateStatusSchema = z.object({
  appointmentId: z.string().min(1),
  newStatus:     z.enum(["CONFIRMED", "NO_SHOW", "COMPLETED"]),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentSchema>;
export type UpdateStatusInput      = z.infer<typeof UpdateStatusSchema>;
