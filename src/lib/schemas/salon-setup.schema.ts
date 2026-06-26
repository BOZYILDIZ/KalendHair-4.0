import { z } from "zod";

// ── Constantes exposées au client (select options) ───────────────────────────

export const TIMEZONES = [
  "Europe/Paris",
  "Europe/London",
  "Europe/Brussels",
  "Europe/Zurich",
  "Europe/Madrid",
  "America/Montreal",
  "America/New_York",
] as const;

export const CURRENCIES = ["EUR", "GBP", "CHF", "USD", "CAD"] as const;

export const LANGUAGES = ["fr", "en"] as const;

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type DayKey = (typeof DAYS_OF_WEEK)[number];

// ── Utilitaires temps ────────────────────────────────────────────────────────

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function timeToMinutes(hhmm: string): number {
  const parts = hhmm.split(":");
  const h = parseInt(parts[0] ?? "0", 10);
  const m = parseInt(parts[1] ?? "0", 10);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const totalMinutes = Math.max(0, minutes);
  const hh = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const mm = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

// ── Schéma d'un jour ─────────────────────────────────────────────────────────

const DayScheduleSchema = z
  .object({
    isOpen: z.boolean(),
    openTime: z
      .string()
      .regex(TIME_RE, "Format HH:MM requis")
      .optional()
      .or(z.literal("")),
    closeTime: z
      .string()
      .regex(TIME_RE, "Format HH:MM requis")
      .optional()
      .or(z.literal("")),
    lunchStart: z
      .string()
      .regex(TIME_RE, "Format HH:MM requis")
      .optional()
      .or(z.literal("")),
    lunchEnd: z
      .string()
      .regex(TIME_RE, "Format HH:MM requis")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((day, ctx) => {
    if (!day.isOpen) return;

    const open = day.openTime && TIME_RE.test(day.openTime) ? day.openTime : null;
    const close = day.closeTime && TIME_RE.test(day.closeTime) ? day.closeTime : null;

    if (!open) {
      ctx.addIssue({ code: "custom", path: ["openTime"], message: "Heure d'ouverture requise" });
    }
    if (!close) {
      ctx.addIssue({ code: "custom", path: ["closeTime"], message: "Heure de fermeture requise" });
    }
    if (open && close) {
      if (timeToMinutes(open) >= timeToMinutes(close)) {
        ctx.addIssue({
          code: "custom",
          path: ["closeTime"],
          message: "La fermeture doit être après l'ouverture",
        });
      }

      const ls = day.lunchStart && TIME_RE.test(day.lunchStart) ? day.lunchStart : null;
      const le = day.lunchEnd && TIME_RE.test(day.lunchEnd) ? day.lunchEnd : null;

      if (ls || le) {
        if (!ls) {
          ctx.addIssue({ code: "custom", path: ["lunchStart"], message: "Début de pause requis" });
        }
        if (!le) {
          ctx.addIssue({ code: "custom", path: ["lunchEnd"], message: "Fin de pause requise" });
        }
        if (ls && le) {
          const lsMin = timeToMinutes(ls);
          const leMin = timeToMinutes(le);
          const openMin = timeToMinutes(open);
          const closeMin = timeToMinutes(close);
          if (lsMin >= leMin) {
            ctx.addIssue({
              code: "custom",
              path: ["lunchEnd"],
              message: "La fin de pause doit être après le début",
            });
          }
          if (lsMin < openMin) {
            ctx.addIssue({
              code: "custom",
              path: ["lunchStart"],
              message: "La pause doit être dans les horaires d'ouverture",
            });
          }
          if (leMin > closeMin) {
            ctx.addIssue({
              code: "custom",
              path: ["lunchEnd"],
              message: "La pause doit être dans les horaires d'ouverture",
            });
          }
        }
      }
    }
  });

// ── Schéma principal ──────────────────────────────────────────────────────────

export const SalonSetupSchema = z.object({
  salonName: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(100, "100 caractères maximum")
    .trim(),
  phone: z.string().max(20, "20 caractères maximum").trim().optional().or(z.literal("")),
  address: z.string().max(200, "200 caractères maximum").trim().optional().or(z.literal("")),
  city: z
    .string()
    .min(1, "La ville est requise")
    .max(100, "100 caractères maximum")
    .trim(),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Code postal à 5 chiffres (ex : 75001)")
    .trim(),
  timezone: z.enum(TIMEZONES, { message: "Fuseau horaire invalide" }),
  currency: z.enum(CURRENCIES, { message: "Devise invalide" }),
  language: z.enum(LANGUAGES, { message: "Langue invalide" }),
  schedule: z.object({
    MONDAY: DayScheduleSchema,
    TUESDAY: DayScheduleSchema,
    WEDNESDAY: DayScheduleSchema,
    THURSDAY: DayScheduleSchema,
    FRIDAY: DayScheduleSchema,
    SATURDAY: DayScheduleSchema,
    SUNDAY: DayScheduleSchema,
  }),
});

export type SalonSetupData = z.infer<typeof SalonSetupSchema>;
