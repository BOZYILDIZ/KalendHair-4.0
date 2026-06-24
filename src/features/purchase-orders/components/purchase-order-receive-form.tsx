"use client";

import { useActionState } from "react";
import type { ReceiveStockFormState } from "../types";

type ReceivableLine = {
  purchaseOrderLineId: string;
  productId: string;
  productName: string;
  productUnit: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityRemaining: number;
  unitCostCents: number;
};

type Props = {
  receivableLines: ReceivableLine[];
  receiveAction: (prev: ReceiveStockFormState, formData: FormData) => Promise<ReceiveStockFormState>;
};

export function PurchaseOrderReceiveForm({ receivableLines, receiveAction }: Props) {
  const [state, dispatch, isPending] = useActionState(receiveAction, null);

  if (receivableLines.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">
        Toutes les lignes ont été réceptionnées intégralement.
      </p>
    );
  }

  return (
    <form action={dispatch} className="space-y-6">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Produit</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Commandé</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Déjà reçu</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Reste</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">À recevoir</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Coût unit. (€)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {receivableLines.map((l, i) => (
              <tr key={l.purchaseOrderLineId}>
                <input type="hidden" name={`purchaseOrderLineId_${i}`} value={l.purchaseOrderLineId} />
                <input type="hidden" name={`productId_${i}`} value={l.productId} />

                <td className="px-4 py-3 font-medium text-gray-900">
                  {l.productName}
                  <span className="ml-1 text-xs text-gray-400">({l.productUnit})</span>
                </td>
                <td className="px-4 py-3 text-right text-gray-500">{l.quantityOrdered}</td>
                <td className="px-4 py-3 text-right text-gray-500">{l.quantityReceived}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {l.quantityRemaining}
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    name={`quantityReceived_${i}`}
                    type="number"
                    min="0"
                    max={l.quantityRemaining}
                    defaultValue={l.quantityRemaining}
                    className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    name={`unitCostEuros_${i}`}
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={(l.unitCostCents / 100).toFixed(2)}
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <label htmlFor="receiveNotes" className="block text-sm font-medium text-gray-700">
          Notes de réception
        </label>
        <textarea
          id="receiveNotes"
          name="receiveNotes"
          rows={2}
          maxLength={1000}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : "Confirmer la réception"}
      </button>
    </form>
  );
}
