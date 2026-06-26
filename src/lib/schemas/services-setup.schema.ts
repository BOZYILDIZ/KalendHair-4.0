import { z } from "zod";

// ── Schéma d'une catégorie dans le payload JSON ───────────────────────────────

const CategoryPayloadSchema = z.object({
  key: z.string().min(1),
  name: z
    .string()
    .min(1, "Le nom de la catégorie est requis")
    .max(50, "50 caractères maximum")
    .trim(),
});

// ── Schéma d'un service dans le payload JSON ──────────────────────────────────

const ServicePayloadSchema = z.object({
  key: z.string().min(1),
  name: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(100, "100 caractères maximum")
    .trim(),
  categoryKey: z.string(),
  durationMinutes: z
    .number()
    .int("La durée doit être un nombre entier")
    .min(5, "Durée minimum : 5 minutes")
    .max(480, "Durée maximum : 480 minutes (8 h)"),
  priceEuros: z
    .number()
    .nonnegative("Le prix ne peut pas être négatif")
    .max(10000, "Prix maximum : 10 000 €"),
  color: z
    .string()
    .max(7)
    .refine(
      (s) => s === "" || /^#[0-9a-fA-F]{6}$/.test(s),
      "Format de couleur invalide (ex : #FF5733)",
    ),
  description: z.string().max(500, "500 caractères maximum"),
  isActive: z.boolean(),
});

// ── Schéma principal du payload ───────────────────────────────────────────────

export const ServicesSetupPayloadSchema = z
  .object({
    categories: z
      .array(CategoryPayloadSchema)
      .max(20, "20 catégories maximum"),
    services: z
      .array(ServicePayloadSchema)
      .min(1, "Au moins un service est requis")
      .max(50, "50 services maximum"),
  })
  .superRefine((data, ctx) => {
    // Noms de catégories uniques (insensible à la casse)
    const catNames = data.categories.map((c) => c.name.toLowerCase().trim());
    catNames.forEach((name, i) => {
      if (catNames.indexOf(name) !== i) {
        ctx.addIssue({
          code: "custom",
          path: ["categories", i, "name"],
          message: "Ce nom de catégorie est déjà utilisé",
        });
      }
    });

    // Noms de services uniques (insensible à la casse)
    const svcNames = data.services.map((s) => s.name.toLowerCase().trim());
    svcNames.forEach((name, i) => {
      if (svcNames.indexOf(name) !== i) {
        ctx.addIssue({
          code: "custom",
          path: ["services", i, "name"],
          message: "Ce nom de service est déjà utilisé",
        });
      }
    });

    // Chaque categoryKey non vide doit référencer une catégorie existante
    const catKeys = new Set(data.categories.map((c) => c.key));
    data.services.forEach((svc, i) => {
      if (svc.categoryKey && !catKeys.has(svc.categoryKey)) {
        ctx.addIssue({
          code: "custom",
          path: ["services", i, "categoryKey"],
          message: "Catégorie introuvable",
        });
      }
    });
  });

export type ServicesSetupPayload = z.infer<typeof ServicesSetupPayloadSchema>;

// ── Type d'état retourné par l'action ────────────────────────────────────────

export type ServicesSetupState = null | { error: string };
