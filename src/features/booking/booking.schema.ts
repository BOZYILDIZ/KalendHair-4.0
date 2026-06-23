import { z } from "zod";

export const PublicBookingSchema = z.object({
  firstName:  z.string().min(1, "Prénom requis").max(100),
  lastName:   z.string().min(1, "Nom requis").max(100),
  email:      z.string().email("Email invalide").max(255),
  phone:      z.string().max(20).optional(),
  serviceId:  z.string().min(1, "Service requis"),
  employeeId: z.string().min(1, "Employé requis"),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  slot:       z.string().regex(/^\d{1,4}$/, "Créneau invalide"),
});

export type PublicBookingFormInput = z.infer<typeof PublicBookingSchema>;
