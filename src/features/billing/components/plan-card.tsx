// Codex — Sprint 18
import type { BillingPlanView, PlanCode } from "../types";

const FEATURES: Record<PlanCode, string[]> = {
  ESSENTIAL: [
    "Agenda & rendez-vous",
    "CRM clients",
    "Réservation publique",
    "Notifications email",
  ],
  PRO: [
    "Tout Essential",
    "Dashboard KPI",
    "Stocks & Produits",
    "Fournisseurs & Commandes",
    "Caisse POS",
  ],
  BUSINESS: [
    "Tout Pro",
    "Salons illimités",
    "Employés illimités",
    "Support prioritaire",
  ],
};

function fmt(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

type Props = {
  plan:       BillingPlanView;
  isCurrent?: boolean;
};

export function PlanCard({ plan, isCurrent }: Props) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        isCurrent ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200 bg-white"
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
          {isCurrent && (
            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
              Actuel
            </span>
          )}
        </div>
        {plan.description && (
          <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
        )}
      </div>

      <div className="mb-4 space-y-1">
        <p className="text-2xl font-bold text-gray-900">
          {fmt(plan.monthlyPriceCents)}
          <span className="text-sm font-normal text-gray-500">/mois</span>
        </p>
        <p className="text-sm text-gray-500">
          ou {fmt(plan.yearlyPriceCents)}/an{" "}
          <span className="font-medium text-green-600">
            (économie {fmt(plan.monthlyPriceCents * 12 - plan.yearlyPriceCents)})
          </span>
        </p>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        {plan.maxSalons !== null
          ? `${plan.maxSalons} salon${plan.maxSalons > 1 ? "s" : ""}`
          : "Salons illimités"}{" "}
        ·{" "}
        {plan.maxEmployees !== null
          ? `${plan.maxEmployees} employé${plan.maxEmployees > 1 ? "s" : ""}`
          : "Employés illimités"}
      </div>

      <ul className="space-y-1.5">
        {FEATURES[plan.code].map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-green-500">✓</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
