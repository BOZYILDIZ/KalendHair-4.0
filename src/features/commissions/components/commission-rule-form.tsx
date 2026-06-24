"use client";

import { useActionState } from "react";
import type { RuleFormState } from "@/features/commissions/types";

type RuleAction = (prev: RuleFormState, formData: FormData) => Promise<RuleFormState>;

type EmployeeOption = { id: string; firstName: string; lastName: string };
type ServiceOption  = { id: string; name: string };
type ProductOption  = { id: string; name: string };

const initState: RuleFormState = {};

export function CommissionRuleForm({
  action,
  employees,
  services,
  products,
  defaultValues,
  submitLabel = "Créer la règle",
}: {
  action: RuleAction;
  employees: EmployeeOption[];
  services: ServiceOption[];
  products: ProductOption[];
  defaultValues?: {
    employeeId?: string;
    serviceId?: string;
    productId?: string;
    type?: string;
    value?: number;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      )}

      {/* Employé */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Employé
        </label>
        <p className="mb-1 text-xs text-gray-400">
          Laisser vide pour appliquer à tous les employés.
        </p>
        <select
          name="employeeId"
          defaultValue={defaultValues?.employeeId ?? ""}
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Tous les employés —</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Prestation */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Prestation ciblée
        </label>
        <p className="mb-1 text-xs text-gray-400">
          Laisser vide pour toutes les prestations (incompatible avec Produit).
        </p>
        <select
          name="serviceId"
          defaultValue={defaultValues?.serviceId ?? ""}
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Toutes les prestations —</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Produit */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Produit ciblé
        </label>
        <p className="mb-1 text-xs text-gray-400">
          Laisser vide pour tous les produits (incompatible avec Prestation).
        </p>
        <select
          name="productId"
          defaultValue={defaultValues?.productId ?? ""}
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Tous les produits —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Type de commission
        </label>
        <select
          name="type"
          defaultValue={defaultValues?.type ?? "PERCENTAGE"}
          required
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="PERCENTAGE">Pourcentage (%)</option>
          <option value="FIXED_AMOUNT">Montant fixe (€ par unité)</option>
        </select>
      </div>

      {/* Valeur */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Valeur
        </label>
        <p className="mb-1 text-xs text-gray-400">
          Pourcentage : entier 1–100. Montant fixe : entier en centimes (ex : 500 = 5,00 €).
        </p>
        <input
          name="value"
          type="number"
          min="1"
          required
          defaultValue={defaultValues?.value ?? ""}
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {pending ? "Enregistrement..." : submitLabel}
      </button>
    </form>
  );
}
