"use client";

import { useActionState } from "react";
import { completeOnboardingAction } from "../actions";
import type { FinalisationState } from "../actions";
import type { CheckItem, SalonSummary } from "../page";

// ── Icônes status ─────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: CheckItem["status"] }) {
  if (status === "PASS") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
        ✓
      </span>
    );
  }
  if (status === "WARN") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
        !
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
      ✗
    </span>
  );
}

// ── Composant ─────────────────────────────────────────────────────────────────

interface Props {
  items: CheckItem[];
  summary: SalonSummary;
  hasBlocking: boolean;
}

export function FinalisationForm({ items, summary, hasBlocking }: Props) {
  const [state, formAction, isPending] = useActionState<
    FinalisationState,
    FormData
  >(completeOnboardingAction, null);

  return (
    <>
      {/* ── Résumé du salon ───────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-500">
          Votre salon
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-slate-400">Nom</dt>
            <dd className="font-medium text-slate-800">{summary.salonName}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Ville</dt>
            <dd className="font-medium text-slate-800">
              {summary.city ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Plan</dt>
            <dd className="font-medium text-slate-800">{summary.planCode}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Services</dt>
            <dd className="font-medium text-slate-800">
              {summary.servicesCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Employés</dt>
            <dd className="font-medium text-slate-800">
              {summary.employeesCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Jours ouverts</dt>
            <dd className="font-medium text-slate-800">
              {summary.openDaysCount} / 7
            </dd>
          </div>
        </dl>
      </div>

      {/* ── Checklist ────────────────────────────────────────────────────── */}
      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 px-4 py-3 ${
              idx < items.length - 1 ? "border-b border-slate-100" : ""
            } ${item.status === "BLOCKING" ? "bg-red-50" : item.status === "WARN" ? "bg-amber-50" : ""}`}
          >
            <StatusIcon status={item.status} />
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  item.status === "BLOCKING"
                    ? "text-red-700"
                    : item.status === "WARN"
                      ? "text-amber-700"
                      : "text-slate-800"
                }`}
              >
                {item.label}
              </p>
              {item.detail && (
                <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
              )}
            </div>
            {item.link && item.status !== "PASS" && (
              <a
                href={item.link}
                className="shrink-0 text-xs font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                Compléter →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* ── Erreur action serveur ─────────────────────────────────────────── */}
      {state?.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="whitespace-pre-line text-sm font-medium text-red-700">
            {state.error}
          </p>
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <form action={formAction}>
        <div className="flex items-center justify-between">
          <a
            href="/onboarding/schedule"
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            ← Revenir aux horaires
          </a>
          <button
            type="submit"
            disabled={hasBlocking || isPending}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? "Finalisation…"
              : "Terminer et accéder au tableau de bord →"}
          </button>
        </div>
      </form>

      {hasBlocking && (
        <p className="mt-3 text-center text-xs text-red-600">
          Corrigez les éléments bloquants avant de continuer.
        </p>
      )}
    </>
  );
}
