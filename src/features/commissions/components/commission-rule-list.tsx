"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { CommissionRuleView, RuleFormState } from "@/features/commissions/types";

type DeactivateAction = (
  prev: RuleFormState,
  formData: FormData,
) => Promise<RuleFormState>;

const initState: RuleFormState = {};

function formatValue(type: CommissionRuleView["type"], value: number): string {
  if (type === "PERCENTAGE") return `${value} %`;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR",
  }).format(value / 100);
}

function RuleRow({
  rule,
  deactivateAction,
}: {
  rule: CommissionRuleView;
  deactivateAction: DeactivateAction;
}) {
  const [state, formAction, pending] = useActionState(deactivateAction, initState);

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50">
      <td className="py-3 pr-4 text-sm text-gray-700">
        {rule.employeeName ?? <span className="italic text-gray-400">Tous les employés</span>}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-700">
        {rule.serviceName
          ? rule.serviceName
          : rule.productName
            ? rule.productName
            : <span className="italic text-gray-400">Toutes cibles</span>
        }
      </td>
      <td className="py-3 pr-4 text-sm">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${
          rule.type === "PERCENTAGE"
            ? "bg-blue-100 text-blue-800"
            : "bg-purple-100 text-purple-800"
        }`}>
          {rule.type === "PERCENTAGE" ? "%" : "Fixe"}
        </span>
      </td>
      <td className="py-3 pr-4 text-sm font-medium text-gray-900">
        {formatValue(rule.type, rule.value)}
      </td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          {state.error && (
            <span className="text-xs text-red-600">{state.error}</span>
          )}
          <Link
            href={`/dashboard/commissions/rules/${rule.id}/edit`}
            className="text-xs text-indigo-600 hover:underline"
          >
            Modifier
          </Link>
          <form action={formAction}>
            <input type="hidden" name="ruleId" value={rule.id} />
            <button
              type="submit"
              disabled={pending}
              className="text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              {pending ? "..." : "Désactiver"}
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

export function CommissionRuleList({
  rules,
  deactivateAction,
}: {
  rules: CommissionRuleView[];
  deactivateAction: DeactivateAction;
}) {
  if (rules.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        Aucune règle active.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b text-left text-xs font-medium uppercase text-gray-500">
            <th className="py-2 pr-4">Employé</th>
            <th className="py-2 pr-4">Cible</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Valeur</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              deactivateAction={deactivateAction}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
