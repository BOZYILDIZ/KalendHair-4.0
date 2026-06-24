// Codex — Sprint 18
"use client";

import { useActionState } from "react";
import type { OrgSubscriptionView, BillingPlanView, UpgradePlanFormState } from "../types";
import { BillingStatusBadge } from "./billing-status-badge";

type Props = {
  subscription:    OrgSubscriptionView | null;
  plans:           BillingPlanView[];
  upgradeAction:   (prev: UpgradePlanFormState, fd: FormData) => Promise<UpgradePlanFormState>;
  changeCycleAction: (prev: UpgradePlanFormState, fd: FormData) => Promise<UpgradePlanFormState>;
};

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(d));
}

function fmtEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

export function BillingCurrentPlan({ subscription, plans, upgradeAction, changeCycleAction }: Props) {
  const [upgradeState, upgradeDispatch, upgradePending] = useActionState(upgradeAction, null);
  const [cycleState,   cycleDispatch,   cyclePending]   = useActionState(changeCycleAction, null);

  const otherPlans = subscription
    ? plans.filter((p) => p.code !== subscription.planCode)
    : plans;

  return (
    <div className="space-y-6">
      {/* Plan actuel */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Abonnement actuel</h2>

        {subscription ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-bold text-gray-900">{subscription.plan.name}</span>
              <BillingStatusBadge status={subscription.status} />
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {subscription.billingCycle === "MONTHLY" ? "Mensuel" : "Annuel"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 sm:grid-cols-3">
              <div>
                <p className="font-medium text-gray-500">Prix</p>
                <p className="text-gray-900">
                  {subscription.billingCycle === "MONTHLY"
                    ? `${fmtEuros(subscription.plan.monthlyPriceCents)}/mois`
                    : `${fmtEuros(subscription.plan.yearlyPriceCents)}/an`}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Période en cours</p>
                <p className="text-gray-900">
                  {fmtDate(subscription.currentPeriodStart)} → {fmtDate(subscription.currentPeriodEnd)}
                </p>
              </div>
              {subscription.trialEndsAt && (
                <div>
                  <p className="font-medium text-gray-500">Fin d&apos;essai</p>
                  <p className="text-gray-900">{fmtDate(subscription.trialEndsAt)}</p>
                </div>
              )}
            </div>

            {/* Changer cycle */}
            <form action={cycleDispatch} className="mt-2 flex flex-wrap items-center gap-2">
              <input type="hidden" name="billingCycle"
                value={subscription.billingCycle === "MONTHLY" ? "YEARLY" : "MONTHLY"}
              />
              {cycleState?.error && (
                <p className="w-full text-xs text-red-600">{cycleState.error}</p>
              )}
              <button
                type="submit"
                disabled={cyclePending}
                className="rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                {cyclePending
                  ? "…"
                  : subscription.billingCycle === "MONTHLY"
                  ? "Passer en annuel"
                  : "Passer en mensuel"}
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Aucun abonnement actif. Choisissez un plan ci-dessous.
          </p>
        )}
      </div>

      {/* Changer de plan */}
      {otherPlans.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Changer de plan</h2>

          {upgradeState?.error && (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {upgradeState.error}
            </p>
          )}
          {upgradeState?.success && (
            <p className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              Plan mis à jour avec succès.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherPlans.map((p) => (
              <div key={p.id} className="rounded-md border border-gray-200 p-4">
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="mb-3 text-sm text-gray-500">
                  {fmtEuros(p.monthlyPriceCents)}/mois · {fmtEuros(p.yearlyPriceCents)}/an
                </p>
                <form action={upgradeDispatch} className="flex gap-2">
                  <input type="hidden" name="planCode"     value={p.code} />
                  <input type="hidden" name="billingCycle" value={subscription?.billingCycle ?? "MONTHLY"} />
                  <button
                    type="submit"
                    disabled={upgradePending}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {upgradePending ? "…" : "Choisir"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
