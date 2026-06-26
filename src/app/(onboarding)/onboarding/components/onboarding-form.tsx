"use client";

import { useActionState } from "react";
import { createOrganizationAction } from "../actions";
import type { OnboardingState } from "../actions";

const PLANS: Array<{
  code: string;
  name: string;
  price: string;
  description: string;
  features: readonly string[];
  recommended?: true;
}> = [
  {
    code: "ESSENTIAL",
    name: "Essential",
    price: "29€/mois",
    description: "Pour les indépendants et petits salons",
    features: ["1 salon", "2 employés", "Rendez-vous & agenda"],
  },
  {
    code: "PRO",
    name: "Pro",
    price: "59€/mois",
    description: "Pour les salons en croissance",
    features: ["3 salons", "10 employés", "KPI & caisse"],
    recommended: true,
  },
  {
    code: "BUSINESS",
    name: "Business",
    price: "99€/mois",
    description: "Pour les groupes et franchises",
    features: ["Illimité", "Employés illimités", "Toutes les fonctionnalités"],
  },
];

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {errors[0]}
    </p>
  );
}

interface OnboardingFormProps {
  firstName: string;
}

export function OnboardingForm({ firstName }: OnboardingFormProps) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(
    createOrganizationAction,
    null,
  );

  const fe = state?.fieldErrors ?? {};

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

      {/* ── Section Organisation ── */}
      <section aria-labelledby="org-heading">
        <h2
          id="org-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Votre entreprise
        </h2>

        <div className="space-y-1">
          <label
            htmlFor="organizationName"
            className="block text-sm font-medium text-slate-700"
          >
            Nom de l&apos;entreprise
          </label>
          <input
            id="organizationName"
            name="organizationName"
            type="text"
            autoComplete="organization"
            placeholder="Ex : Groupe Beauté Paris"
            aria-describedby={fe.organizationName ? "orgName-error" : undefined}
            aria-invalid={!!fe.organizationName}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
          />
          <div id="orgName-error">
            <FieldError errors={fe.organizationName} />
          </div>
        </div>
      </section>

      {/* ── Section Salon ── */}
      <section aria-labelledby="salon-heading">
        <h2
          id="salon-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Votre salon principal
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="salonName"
              className="block text-sm font-medium text-slate-700"
            >
              Nom du salon
            </label>
            <input
              id="salonName"
              name="salonName"
              type="text"
              placeholder="Ex : Salon Lumière"
              aria-describedby={fe.salonName ? "salonName-error" : undefined}
              aria-invalid={!!fe.salonName}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
            />
            <div id="salonName-error">
              <FieldError errors={fe.salonName} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label
                htmlFor="city"
                className="block text-sm font-medium text-slate-700"
              >
                Ville
              </label>
              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                placeholder="Paris"
                aria-describedby={fe.city ? "city-error" : undefined}
                aria-invalid={!!fe.city}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
              />
              <div id="city-error">
                <FieldError errors={fe.city} />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-slate-700"
              >
                Code postal
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                autoComplete="postal-code"
                placeholder="75001"
                maxLength={5}
                aria-describedby={fe.postalCode ? "cp-error" : undefined}
                aria-invalid={!!fe.postalCode}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
              />
              <div id="cp-error">
                <FieldError errors={fe.postalCode} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-slate-700"
            >
              Adresse{" "}
              <span className="font-normal text-slate-400">(optionnel)</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              autoComplete="street-address"
              placeholder="12 rue de la Paix"
              aria-invalid={!!fe.address}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
            />
            <FieldError errors={fe.address} />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700"
            >
              Téléphone{" "}
              <span className="font-normal text-slate-400">(optionnel)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="01 23 45 67 89"
              aria-invalid={!!fe.phone}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
            />
            <FieldError errors={fe.phone} />
          </div>
        </div>
      </section>

      {/* ── Section Plan ── */}
      <section aria-labelledby="plan-heading">
        <h2
          id="plan-heading"
          className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Votre plan
        </h2>
        <p className="mb-4 text-xs text-slate-400">
          Gratuit pendant le pilote — aucun paiement requis aujourd&apos;hui.
        </p>

        <div className="grid gap-3 sm:grid-cols-3" role="group" aria-label="Choisir un plan">
          {PLANS.map((plan) => (
            <label
              key={plan.code}
              className="relative flex cursor-pointer flex-col rounded-xl border-2 border-slate-200 bg-white p-4 transition hover:border-indigo-300 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
            >
              <input
                type="radio"
                name="planCode"
                value={plan.code}
                defaultChecked={plan.code === "ESSENTIAL"}
                className="sr-only"
              />
              {plan.recommended && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Recommandé
                </span>
              )}
              <span className="text-base font-semibold text-slate-900">
                {plan.name}
              </span>
              <span className="mt-0.5 text-sm font-medium text-indigo-600">
                {plan.price}
              </span>
              <span className="mt-1 text-xs text-slate-500">
                {plan.description}
              </span>
              <ul className="mt-3 space-y-0.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <svg className="h-3.5 w-3.5 shrink-0 text-indigo-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5L13 4" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </label>
          ))}
        </div>
        <FieldError errors={fe.planCode} />
      </section>

      {/* ── Submit ── */}
      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Création de votre espace…"
            : `Créer mon espace, ${firstName} →`}
        </button>

        {/* Lien déconnexion */}
        <form action="/api/auth/logout" method="POST" className="text-center">
          <button
            type="submit"
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </form>
  );
}
