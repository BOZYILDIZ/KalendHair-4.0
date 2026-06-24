import { z } from "zod";

export const CreateSupplierSchema = z.object({
  salonId:        z.string().min(1),
  organizationId: z.string().min(1),
  name:           z.string().min(1, "Le nom est obligatoire.").max(200),
  contactName:    z.string().max(200).optional(),
  email:          z.string().email("Email invalide.").max(200).optional().or(z.literal("")),
  phone:          z.string().max(50).optional(),
  address:        z.string().max(500).optional(),
  notes:          z.string().max(1000).optional(),
});

export type CreateSupplierData = z.infer<typeof CreateSupplierSchema>;

export const UpdateSupplierSchema = z.object({
  salonId:        z.string().min(1),
  organizationId: z.string().min(1),
  name:           z.string().min(1, "Le nom est obligatoire.").max(200),
  contactName:    z.string().max(200).optional().or(z.literal("")),
  email:          z.string().email("Email invalide.").max(200).optional().or(z.literal("")),
  phone:          z.string().max(50).optional().or(z.literal("")),
  address:        z.string().max(500).optional().or(z.literal("")),
  notes:          z.string().max(1000).optional().or(z.literal("")),
});

export type UpdateSupplierData = z.infer<typeof UpdateSupplierSchema>;
