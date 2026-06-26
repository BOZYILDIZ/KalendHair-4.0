import { z } from "zod";

// ── Schéma d'un employé dans le payload JSON ──────────────────────────────────

const EmployeePayloadSchema = z.object({
  key: z.string().min(1),
  firstName: z
    .string()
    .min(1, "Prénom requis")
    .max(50, "50 caractères maximum")
    .trim(),
  lastName: z
    .string()
    .min(1, "Nom requis")
    .max(50, "50 caractères maximum")
    .trim(),
  email: z
    .string()
    .max(100, "100 caractères maximum")
    .trim()
    .refine(
      (s) => s === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
      "Format email invalide",
    ),
  phone: z.string().max(20, "20 caractères maximum").trim(),
  color: z
    .string()
    .max(7)
    .refine(
      (s) => s === "" || /^#[0-9a-fA-F]{6}$/.test(s),
      "Format couleur invalide (ex : #6366f1)",
    ),
  isActive: z.boolean(),
  serviceIds: z
    .array(z.string().min(1))
    .min(1, "Au moins un service est requis par employé")
    .max(50, "50 services maximum"),
});

// ── Schéma principal du payload ───────────────────────────────────────────────

export const EmployeesSetupPayloadSchema = z
  .object({
    employees: z
      .array(EmployeePayloadSchema)
      .min(1, "Au moins un employé est requis")
      .max(20, "20 employés maximum"),
  })
  .superRefine((data, ctx) => {
    // Emails uniques parmi les non-vides
    const emails = data.employees.map((e) => e.email.toLowerCase());
    emails.forEach((email, i) => {
      if (email && emails.indexOf(email) !== i) {
        ctx.addIssue({
          code: "custom",
          path: ["employees", i, "email"],
          message: "Cet email est déjà utilisé par un autre employé",
        });
      }
    });

    // Noms uniques (prénom + nom, insensible à la casse)
    const names = data.employees.map(
      (e) => `${e.firstName.toLowerCase().trim()}|${e.lastName.toLowerCase().trim()}`,
    );
    names.forEach((name, i) => {
      if (names.indexOf(name) !== i) {
        ctx.addIssue({
          code: "custom",
          path: ["employees", i, "firstName"],
          message: "Un employé avec ce prénom et ce nom existe déjà",
        });
      }
    });
  });

export type EmployeesSetupPayload = z.infer<typeof EmployeesSetupPayloadSchema>;

// ── Type d'état retourné par l'action ────────────────────────────────────────

export type EmployeesSetupState = null | { error: string };
