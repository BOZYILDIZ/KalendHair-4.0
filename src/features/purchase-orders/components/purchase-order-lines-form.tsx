"use client";

import { useActionState } from "react";
import type { ProductSummary } from "@/features/inventory/types";
import type { PurchaseOrderFormState } from "../types";

type Props = {
  products: ProductSummary[];
  addLineAction: (prev: PurchaseOrderFormState, formData: FormData) => Promise<PurchaseOrderFormState>;
  removeLineActions: Record<string, (fd: FormData) => Promise<void>>;
  lines: {
    id: string;
    productName: string;
    productUnit: string;
    quantityOrdered: number;
    unitCostCents: number;
    notes: string | null;
  }[];
};

export function PurchaseOrderLinesForm({
  products,
  addLineAction,
  removeLineActions,
  lines,
}: Props) {
  const [addState, addDispatch, isAddPending] = useActionState(addLineAction, null);

  return (
    <div className="space-y-6">
      {lines.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Produit</th>
                <th className="px-3 py-3 text-right font-medium text-gray-600">Qté commandée</th>
                <th className="px-3 py-3 text-right font-medium text-gray-600">Coût unit. HT</th>
                <th className="px-3 py-3 text-right font-medium text-gray-600">Total HT</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Notes</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {lines.map((l) => {
                const removeAction = removeLineActions[l.id];
                return (
                  <tr key={l.id}>
                    <td className="px-3 py-3 font-medium text-gray-900">
                      {l.productName}
                      <span className="ml-1 text-xs text-gray-400">({l.productUnit})</span>
                    </td>
                    <td className="px-3 py-3 text-right">{l.quantityOrdered}</td>
                    <td className="px-3 py-3 text-right">
                      {(l.unitCostCents / 100).toLocaleString("fr-FR", {
                        style: "currency", currency: "EUR",
                      })}
                    </td>
                    <td className="px-3 py-3 text-right font-medium">
                      {((l.quantityOrdered * l.unitCostCents) / 100).toLocaleString("fr-FR", {
                        style: "currency", currency: "EUR",
                      })}
                    </td>
                    <td className="px-3 py-3 text-gray-500">{l.notes ?? "—"}</td>
                    <td className="px-3 py-3 text-right">
                      {removeAction && (
                        <form action={removeAction}>
                          <button
                            type="submit"
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Retirer
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-md border p-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Ajouter une ligne</h3>

        {addState?.error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {addState.error}
          </p>
        )}

        <form action={addDispatch} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="productId" className="block text-xs font-medium text-gray-600">
              Produit <span className="text-red-500">*</span>
            </label>
            <select
              id="productId"
              name="productId"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Choisir…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quantityOrdered" className="block text-xs font-medium text-gray-600">
              Quantité <span className="text-red-500">*</span>
            </label>
            <input
              id="quantityOrdered"
              name="quantityOrdered"
              type="number"
              min="1"
              required
              defaultValue="1"
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="unitCostEuros" className="block text-xs font-medium text-gray-600">
              Coût unit. (€)
            </label>
            <input
              id="unitCostEuros"
              name="unitCostEuros"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0.00"
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="linNotes" className="block text-xs font-medium text-gray-600">
              Notes (optionnel)
            </label>
            <input
              id="linNotes"
              name="linNotes"
              type="text"
              maxLength={500}
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={isAddPending}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
            >
              {isAddPending ? "Ajout…" : "Ajouter la ligne"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
