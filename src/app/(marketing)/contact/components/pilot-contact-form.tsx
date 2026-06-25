"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import { submitContactAction } from "../actions";
import type { ContactState } from "../actions";

/* ─── Initial state ──────────────────────────────────────────────────────────── */

const INITIAL_STATE: ContactState = null;

/* ─── Form data ──────────────────────────────────────────────────────────────── */

const MODULES = [
  { value: "agenda", label: "Agenda & Planning" },
  { value: "reservation", label: "Réservation en ligne" },
  { value: "crm", label: "CRM Clients" },
  { value: "caisse", label: "Paiements & Caisse" },
  { value: "stocks", label: "Stocks" },
  { value: "fournisseurs", label: "Fournisseurs" },
  { value: "commissions", label: "Commissions" },
  { value: "kpi", label: "KPI Dashboard" },
];

const EMPLOYEE_COUNTS = [
  { value: "1", label: "Solo (1 employé)" },
  { value: "2-3", label: "Petit salon (2-3 employés)" },
  { value: "4-5", label: "Salon moyen (4-5 employés)" },
  { value: "6-10", label: "Grand salon (6-10 employés)" },
  { value: "10+", label: "Multi-employés (10 et plus)" },
];

/* ─── Field helpers ──────────────────────────────────────────────────────────── */

const inputClass = cn(
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
  "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
  "transition-colors",
);

const inputErrorClass = "border-red-400 focus:border-red-500 focus:ring-red-500/20";

const labelClass = "block text-sm font-medium text-slate-700";

function FieldError({
  id,
  errors,
}: {
  id: string;
  errors?: string[];
}) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-600" role="alert">
      {errors[0]}
    </p>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function PilotContactForm() {
  const [state, action, pending] = useActionState(
    submitContactAction,
    INITIAL_STATE,
  );

  const errors = state?.errors ?? {};

  return (
    <form action={action} noValidate className="space-y-6">
      {/* Global error */}
      {state && !state.success && state.message && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </div>
      )}

      {/* Nom du salon */}
      <div>
        <label htmlFor="salonName" className={labelClass}>
          Nom du salon <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <div className="mt-1.5">
          <input
            id="salonName"
            name="salonName"
            type="text"
            autoComplete="organization"
            required
            aria-describedby={errors.salonName ? "salonName-error" : undefined}
            aria-invalid={!!errors.salonName}
            className={cn(inputClass, errors.salonName && inputErrorClass)}
            placeholder="L'Atelier Lumière"
          />
        </div>
        <FieldError id="salonName-error" errors={errors.salonName} />
      </div>

      {/* Prénom + Nom */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            Prénom <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              aria-invalid={!!errors.firstName}
              className={cn(inputClass, errors.firstName && inputErrorClass)}
              placeholder="Marie"
            />
          </div>
          <FieldError id="firstName-error" errors={errors.firstName} />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>
            Nom <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              aria-invalid={!!errors.lastName}
              className={cn(inputClass, errors.lastName && inputErrorClass)}
              placeholder="Dupont"
            />
          </div>
          <FieldError id="lastName-error" errors={errors.lastName} />
        </div>
      </div>

      {/* Email + Téléphone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            E-mail <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
              className={cn(inputClass, errors.email && inputErrorClass)}
              placeholder="marie@atelierluimiere.fr"
            />
          </div>
          <FieldError id="email-error" errors={errors.email} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Téléphone <span className="text-slate-400 font-normal">(optionnel)</span>
          </label>
          <div className="mt-1.5">
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClass}
              placeholder="06 12 34 56 78"
            />
          </div>
        </div>
      </div>

      {/* Ville + Employés */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={labelClass}>
            Ville <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              required
              aria-describedby={errors.city ? "city-error" : undefined}
              aria-invalid={!!errors.city}
              className={cn(inputClass, errors.city && inputErrorClass)}
              placeholder="Paris"
            />
          </div>
          <FieldError id="city-error" errors={errors.city} />
        </div>
        <div>
          <label htmlFor="employeeCount" className={labelClass}>
            Nombre d&apos;employés <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <select
              id="employeeCount"
              name="employeeCount"
              required
              defaultValue=""
              aria-describedby={errors.employeeCount ? "employeeCount-error" : undefined}
              aria-invalid={!!errors.employeeCount}
              className={cn(inputClass, errors.employeeCount && inputErrorClass)}
            >
              <option value="" disabled>
                Sélectionnez...
              </option>
              {EMPLOYEE_COUNTS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <FieldError id="employeeCount-error" errors={errors.employeeCount} />
        </div>
      </div>

      {/* Modules */}
      <fieldset>
        <legend className={cn(labelClass, "mb-3")}>
          Modules qui vous intéressent{" "}
          <span aria-hidden="true" className="text-red-500">*</span>
        </legend>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-2"
          aria-describedby={errors.modules ? "modules-error" : undefined}
        >
          {MODULES.map((mod) => (
            <label
              key={mod.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-800"
            >
              <input
                type="checkbox"
                name="modules"
                value={mod.value}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {mod.label}
            </label>
          ))}
        </div>
        {errors.modules && (
          <p id="modules-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.modules[0]}
          </p>
        )}
      </fieldset>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelClass}>
          Message libre{" "}
          <span className="text-slate-400 font-normal">(optionnel)</span>
        </label>
        <div className="mt-1.5">
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={2000}
            aria-describedby={errors.message ? "message-error" : undefined}
            aria-invalid={!!errors.message}
            className={cn(
              inputClass,
              "resize-y",
              errors.message && inputErrorClass,
            )}
            placeholder="Décrivez votre situation, vos besoins particuliers ou posez vos questions..."
          />
        </div>
        <FieldError id="message-error" errors={errors.message} />
      </div>

      {/* RGPD */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="gdprConsent"
            required
            aria-describedby={errors.gdprConsent ? "gdprConsent-error" : undefined}
            aria-invalid={!!errors.gdprConsent}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-600">
            {"J'accepte que KalendHair utilise mes coordonnées pour traiter ma candidature pilote et me recontacter. Aucun démarchage commercial, données non partagées avec des tiers."}{" "}
            <span aria-hidden="true" className="text-red-500">*</span>
          </span>
        </label>
        {errors.gdprConsent && (
          <p id="gdprConsent-error" className="mt-1.5 text-sm text-red-600 pl-7" role="alert">
            {errors.gdprConsent[0]}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={cn(
          "w-full rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm",
          "hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {pending ? "Envoi en cours…" : "Envoyer ma candidature →"}
      </button>

      <p className="text-center text-xs text-slate-500">
        <span aria-hidden="true" className="text-red-500">*</span>{" "}
        Champs obligatoires
      </p>
    </form>
  );
}
