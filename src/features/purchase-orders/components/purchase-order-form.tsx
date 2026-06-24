"use client";

import { useActionState } from "react";
import type { SupplierSummary } from "@/features/suppliers/types";
import type { PurchaseOrderFormState } from "../types";

type Props = {
  suppliers: SupplierSummary[];
  action: (prev: PurchaseOrderFormState, formData: FormData) => Promise<PurchaseOrderFormState>;
};

export function PurchaseOrderForm({ suppliers, action }: Props) {
  const [state, dispatch, isPending] = useActionState(action, null);

  return (
    <form action={dispatch} className="space-y-5">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">
          Fournisseur <span className="text-red-500">*</span>
        </label>
        <select
          id="supplierId"
          name="supplierId"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Sélectionner un fournisseur…</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
          Référence interne
        </label>
        <input
          id="reference"
          name="reference"
          type="text"
          maxLength={100}
          placeholder="ex : CMD-2026-001"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="expectedAt" className="block text-sm font-medium text-gray-700">
          Date de livraison prévue
        </label>
        <input
          id="expectedAt"
          name="expectedAt"
          type="date"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={1000}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Création…" : "Créer le bon de commande"}
      </button>
    </form>
  );
}
