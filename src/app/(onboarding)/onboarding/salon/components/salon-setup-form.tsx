"use client";

import { useState, useActionState } from "react";
import { updateSalonSetupAction } from "../actions";
import type { SalonSetupState } from "../actions";
import type { ScheduleInit } from "../page";
import {
  TIMEZONES,
  CURRENCIES,
  LANGUAGES,
  DAYS_OF_WEEK,
  type DayKey,
} from "@/lib/schemas/salon-setup.schema";

// ── Labels lisibles ───────────────────────────────────────────────────────────

const DAY_LABELS: Record<DayKey, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

const CURRENCY_LABELS: Record<string, string> = {
  EUR: "€ Euro",
  GBP: "£ Livre sterling",
  CHF: "Fr Franc suisse",
  USD: "$ Dollar US",
  CAD: "$ Dollar canadien",
};

const LANGUAGE_LABELS: Record<string, string> = {
  fr: "Français",
  en: "English",
};

const TIMEZONE_LABELS: Record<string, string> = {
  "Europe/Paris": "Europe/Paris (UTC+1/+2)",
  "Europe/London": "Europe/London (UTC+0/+1)",
  "Europe/Brussels": "Europe/Brussels (UTC+1/+2)",
  "Europe/Zurich": "Europe/Zurich (UTC+1/+2)",
  "Europe/Madrid": "Europe/Madrid (UTC+1/+2)",
  "America/Montreal": "America/Montreal (UTC-5/-4)",
  "America/New_York": "America/New_York (UTC-5/-4)",
};

// ── Helpers UI ────────────────────────────────────────────────────────────────

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {error}
    </p>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function TextInput({
  id,
  name,
  defaultValue,
  placeholder,
  type = "text",
  autoComplete,
  error,
  maxLength,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1">
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={!!error}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
      />
      <FieldError error={error} />
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

interface SalonSetupFormProps {
  salonData: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    timezone: string;
    currency: string;
    language: string;
  };
  scheduleInit: ScheduleInit;
}

export function SalonSetupForm({ salonData, scheduleInit }: SalonSetupFormProps) {
  const [state, action, pending] = useActionState<SalonSetupState, FormData>(
    updateSalonSetupAction,
    null,
  );

  const fe = state?.fieldErrors ?? {};

  // État local pour les toggles d'ouverture de chaque jour
  const [dayOpen, setDayOpen] = useState<Record<DayKey, boolean>>(() => {
    const init: Partial<Record<DayKey, boolean>> = {};
    for (const day of DAYS_OF_WEEK) {
      init[day] = scheduleInit[day].isOpen;
    }
    return init as Record<DayKey, boolean>;
  });

  // État local pour les toggles de pause déjeuner
  const [lunchOpen, setLunchOpen] = useState<Record<DayKey, boolean>>(() => {
    const init: Partial<Record<DayKey, boolean>> = {};
    for (const day of DAYS_OF_WEEK) {
      init[day] = !!scheduleInit[day].lunchStart;
    }
    return init as Record<DayKey, boolean>;
  });

  return (
    <form action={action} className="space-y-8" noValidate>
      {/* Erreur globale */}
      {state?.error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {/* ── Section Informations ── */}
      <section aria-labelledby="info-heading">
        <h2
          id="info-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Informations du salon
        </h2>

        <div className="space-y-4">
          {/* Nom commercial */}
          <div>
            <Label htmlFor="salonName">Nom commercial</Label>
            <TextInput
              id="salonName"
              name="salonName"
              defaultValue={salonData.name}
              placeholder="Salon Lumière"
              maxLength={100}
              error={fe["salonName"]?.[0]}
            />
          </div>

          {/* Téléphone */}
          <div>
            <Label htmlFor="phone">
              Téléphone{" "}
              <span className="font-normal text-slate-400">(optionnel)</span>
            </Label>
            <TextInput
              id="phone"
              name="phone"
              type="tel"
              defaultValue={salonData.phone}
              placeholder="01 23 45 67 89"
              autoComplete="tel"
              maxLength={20}
              error={fe["phone"]?.[0]}
            />
          </div>

          {/* Adresse */}
          <div>
            <Label htmlFor="address">
              Adresse{" "}
              <span className="font-normal text-slate-400">(optionnel)</span>
            </Label>
            <TextInput
              id="address"
              name="address"
              defaultValue={salonData.address}
              placeholder="12 rue de la Paix"
              autoComplete="street-address"
              maxLength={200}
              error={fe["address"]?.[0]}
            />
          </div>

          {/* Ville + Code postal */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label htmlFor="city">Ville</Label>
              <TextInput
                id="city"
                name="city"
                defaultValue={salonData.city}
                placeholder="Paris"
                autoComplete="address-level2"
                maxLength={100}
                error={fe["city"]?.[0]}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Code postal</Label>
              <TextInput
                id="postalCode"
                name="postalCode"
                defaultValue={salonData.postalCode}
                placeholder="75001"
                autoComplete="postal-code"
                maxLength={5}
                error={fe["postalCode"]?.[0]}
              />
            </div>
          </div>

          {/* Logo (placeholder) */}
          <div>
            <Label htmlFor="logo-placeholder">Logo</Label>
            <div className="flex items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-400">
                🖼
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Upload du logo</p>
                <p className="text-xs text-slate-400">Disponible dans une prochaine mise à jour</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section Paramètres régionaux ── */}
      <section aria-labelledby="locale-heading">
        <h2
          id="locale-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Paramètres régionaux
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Fuseau horaire */}
          <div>
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={salonData.timezone}
              aria-invalid={!!fe["timezone"]}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {TIMEZONE_LABELS[tz] ?? tz}
                </option>
              ))}
            </select>
            <FieldError error={fe["timezone"]?.[0]} />
          </div>

          {/* Devise */}
          <div>
            <Label htmlFor="currency">Devise</Label>
            <select
              id="currency"
              name="currency"
              defaultValue={salonData.currency}
              aria-invalid={!!fe["currency"]}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {CURRENCY_LABELS[c] ?? c}
                </option>
              ))}
            </select>
            <FieldError error={fe["currency"]?.[0]} />
          </div>

          {/* Langue */}
          <div>
            <Label htmlFor="language">Langue</Label>
            <select
              id="language"
              name="language"
              defaultValue={salonData.language}
              aria-invalid={!!fe["language"]}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {LANGUAGE_LABELS[l] ?? l}
                </option>
              ))}
            </select>
            <FieldError error={fe["language"]?.[0]} />
          </div>
        </div>
      </section>

      {/* ── Section Horaires ── */}
      <section aria-labelledby="schedule-heading">
        <h2
          id="schedule-heading"
          className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Horaires d&apos;ouverture
        </h2>
        <p className="mb-4 text-xs text-slate-400">
          Configurez les horaires de chaque jour. Modifiable à tout moment depuis le tableau de bord.
        </p>

        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {DAYS_OF_WEEK.map((day) => {
            const isOpen = dayOpen[day];
            const hasLunch = lunchOpen[day];
            const dayInit = scheduleInit[day];

            const dayKey = day as DayKey;
            const schedErr = (sub: string) =>
              fe[`schedule.${day}.${sub}`]?.[0] ?? fe[`schedule.${day}.${sub}`]?.[0];

            return (
              <div key={day} className="px-4 py-4">
                {/* Ligne principale : nom du jour + toggle ouvert/fermé */}
                <div className="flex items-center justify-between">
                  <span className="w-24 text-sm font-medium text-slate-700">
                    {DAY_LABELS[dayKey]}
                  </span>

                  {/* Toggle ouvert/fermé */}
                  <label className="relative flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      name={`${day}_isOpen`}
                      value="on"
                      checked={isOpen}
                      onChange={(e) =>
                        setDayOpen((prev) => ({ ...prev, [day]: e.target.checked }))
                      }
                      className="sr-only"
                    />
                    <span
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        isOpen ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          isOpen ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </span>
                    <span className="text-xs text-slate-500">
                      {isOpen ? "Ouvert" : "Fermé"}
                    </span>
                  </label>
                </div>

                {/* Horaires (visibles si ouvert) */}
                {isOpen && (
                  <div className="mt-3 space-y-3 pl-0">
                    {/* Ouverture / Fermeture */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <label
                          htmlFor={`${day}_openTime`}
                          className="mb-1 block text-xs text-slate-500"
                        >
                          Ouverture
                        </label>
                        <input
                          id={`${day}_openTime`}
                          type="time"
                          name={`${day}_openTime`}
                          defaultValue={dayInit.openTime}
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <FieldError error={schedErr("openTime")} />
                      </div>

                      <div className="flex-1">
                        <label
                          htmlFor={`${day}_closeTime`}
                          className="mb-1 block text-xs text-slate-500"
                        >
                          Fermeture
                        </label>
                        <input
                          id={`${day}_closeTime`}
                          type="time"
                          name={`${day}_closeTime`}
                          defaultValue={dayInit.closeTime}
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <FieldError error={schedErr("closeTime")} />
                      </div>
                    </div>

                    {/* Pause déjeuner */}
                    <div>
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
                        <input
                          type="checkbox"
                          checked={hasLunch}
                          onChange={(e) =>
                            setLunchOpen((prev) => ({ ...prev, [day]: e.target.checked }))
                          }
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Pause déjeuner
                      </label>

                      {hasLunch && (
                        <div className="mt-2 flex items-start gap-3 pl-5">
                          <div className="flex-1">
                            <label
                              htmlFor={`${day}_lunchStart`}
                              className="mb-1 block text-xs text-slate-400"
                            >
                              Début
                            </label>
                            <input
                              id={`${day}_lunchStart`}
                              type="time"
                              name={`${day}_lunchStart`}
                              defaultValue={dayInit.lunchStart || "12:00"}
                              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <FieldError error={schedErr("lunchStart")} />
                          </div>

                          <div className="flex-1">
                            <label
                              htmlFor={`${day}_lunchEnd`}
                              className="mb-1 block text-xs text-slate-400"
                            >
                              Fin
                            </label>
                            <input
                              id={`${day}_lunchEnd`}
                              type="time"
                              name={`${day}_lunchEnd`}
                              defaultValue={dayInit.lunchEnd || "13:30"}
                              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <FieldError error={schedErr("lunchEnd")} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Boutons de navigation ── */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <a
          href="/dashboard"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Précédent
        </a>

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sauvegarde en cours…" : "Continuer →"}
        </button>
      </div>
    </form>
  );
}
