import { z } from "zod";

const TIME_REGEX = /^\d{2}:\d{2}$/;

const DAY_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const DayScheduleSchema = z.object({
  dayOfWeek: z.enum(DAY_OF_WEEK),
  isOpen: z.boolean(),
  openTime: z.string().regex(TIME_REGEX, "Format HH:mm requis"),
  closeTime: z.string().regex(TIME_REGEX, "Format HH:mm requis"),
  hasLunch: z.boolean(),
  lunchStartTime: z.string().regex(TIME_REGEX, "Format HH:mm requis"),
  lunchEndTime: z.string().regex(TIME_REGEX, "Format HH:mm requis"),
});

export const ScheduleSetupPayloadSchema = z
  .object({
    days: z
      .array(DayScheduleSchema)
      .length(7, "Les 7 jours de la semaine sont requis"),
  })
  .superRefine((data, ctx) => {
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return (h ?? 0) * 60 + (m ?? 0);
    };

    data.days.forEach((day, i) => {
      if (!day.isOpen) return;

      const open = toMin(day.openTime);
      const close = toMin(day.closeTime);

      if (open >= close) {
        ctx.addIssue({
          code: "custom",
          path: ["days", i, "closeTime"],
          message:
            "L'heure de fermeture doit être après l'heure d'ouverture",
        });
      }

      if (day.hasLunch) {
        const lunchStart = toMin(day.lunchStartTime);
        const lunchEnd = toMin(day.lunchEndTime);

        if (lunchStart >= lunchEnd) {
          ctx.addIssue({
            code: "custom",
            path: ["days", i, "lunchEndTime"],
            message: "La fin de pause doit être après le début de pause",
          });
        }
        if (lunchStart <= open) {
          ctx.addIssue({
            code: "custom",
            path: ["days", i, "lunchStartTime"],
            message: "La pause doit commencer après l'ouverture",
          });
        }
        if (lunchEnd >= close) {
          ctx.addIssue({
            code: "custom",
            path: ["days", i, "lunchEndTime"],
            message: "La pause doit se terminer avant la fermeture",
          });
        }
      }
    });
  });

export type ScheduleSetupState = null | { error: string };
