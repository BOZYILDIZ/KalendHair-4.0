"use client";

import { useActionState, useMemo, useState } from "react";
import { updateScheduleSetupAction } from "../actions";
import type { ScheduleSetupState } from "@/lib/schemas/schedule-setup.schema";
import type { DayScheduleInit } from "../page";

// ── Types internes ────────────────────────────────────────────────────────────

interface DayDraft {
  dayOfWeek: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasLunch: boolean;
  lunchStartTime: string;
  lunchEndTime: string;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

// ── Composant ─────────────────────────────────────────────────────────────────

interface Props {
  scheduleInits: DayScheduleInit[];
}

export function ScheduleSetupForm({ scheduleInits }: Props) {
  const [state, formAction, isPending] = useActionState<
    ScheduleSetupState,
    FormData
  >(updateScheduleSetupAction, null);

  const [days, setDays] = useState<DayDraft[]>(() =>
    scheduleInits.map((d) => ({ ...d })),
  );

  // ── Payload JSON sérialisé ────────────────────────────────────────────────
  const payload = useMemo(() => JSON.stringify({ days }), [days]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateDay = (dayOfWeek: string, updates: Partial<DayDraft>) => {
    setDays((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...updates } : d)),
    );
  };

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="payload" value={payload} />

      {/* ── Message d'erreur global ─────────────────────────────────────── */}
      {state?.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="whitespace-pre-line text-sm font-medium text-red-700">
            {state.error}
          </p>
        </div>
      )}

      {/* ── Grille des jours ────────────────────────────────────────────── */}
      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {days.map((day, idx) => {
          const isLast = idx === days.length - 1;
          return (
            <div
              key={day.dayOfWeek}
              className={`p-4 ${!isLast ? "border-b border-slate-100" : ""} ${
                !day.isOpen ? "bg-slate-50" : ""
              }`}
            >
              {/* Ligne principale : nom + fermé + heures */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Nom du jour */}
                <span
                  className={`w-24 shrink-0 text-sm font-semibold ${
                    day.isOpen ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {DAY_LABELS[day.dayOfWeek]}
                </span>

                {/* Toggle Fermé */}
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={!day.isOpen}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, { isOpen: !e.target.checked })
                    }
                    className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                  />
                  Fermé
                </label>

                {/* Heures ouverture/fermeture */}
                <div
                  className={`flex flex-1 flex-wrap items-center gap-2 ${
                    !day.isOpen ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <input
                    type="time"
                    value={day.openTime}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, { openTime: e.target.value })
                    }
                    disabled={!day.isOpen}
                    aria-label={`Heure d'ouverture ${DAY_LABELS[day.dayOfWeek]}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <span className="text-xs text-slate-400">→</span>
                  <input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, { closeTime: e.target.value })
                    }
                    disabled={!day.isOpen}
                    aria-label={`Heure de fermeture ${DAY_LABELS[day.dayOfWeek]}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Pause déjeuner */}
              {day.isOpen && (
                <div className="mt-2.5 ml-24 flex flex-wrap items-center gap-3 pl-0">
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={day.hasLunch}
                      onChange={(e) =>
                        updateDay(day.dayOfWeek, { hasLunch: e.target.checked })
                      }
                      className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                    />
                    Pause déjeuner
                  </label>

                  {day.hasLunch && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={day.lunchStartTime}
                        onChange={(e) =>
                          updateDay(day.dayOfWeek, {
                            lunchStartTime: e.target.value,
                          })
                        }
                        aria-label={`Début pause ${DAY_LABELS[day.dayOfWeek]}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <span className="text-xs text-slate-400">→</span>
                      <input
                        type="time"
                        value={day.lunchEndTime}
                        onChange={(e) =>
                          updateDay(day.dayOfWeek, {
                            lunchEndTime: e.target.value,
                          })
                        }
                        aria-label={`Fin pause ${DAY_LABELS[day.dayOfWeek]}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Résumé compact ────────────────────────────────────────────────── */}
      <p className="mb-6 text-xs text-slate-400">
        {days.filter((d) => d.isOpen).length} jour
        {days.filter((d) => d.isOpen).length !== 1 ? "s" : ""} d&apos;ouverture
        · {days.filter((d) => !d.isOpen).length} jour
        {days.filter((d) => !d.isOpen).length !== 1 ? "s" : ""} de fermeture
      </p>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <a
          href="/onboarding/employees"
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          ← Précédent
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Enregistrement…" : "Continuer →"}
        </button>
      </div>
    </form>
  );
}
