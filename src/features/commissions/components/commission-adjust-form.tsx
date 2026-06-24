"use client";

import { useActionState } from "react";
import type { AdjustFormState } from "@/features/commissions/types";

type AdjustAction = (
  prev: AdjustFormState,
  formData: FormData,
) => Promise<AdjustFormState>;

const initState: AdjustFormState = {};

export function CommissionAdjustForm({
  entryId,
  action,
}: {
  entryId: string;
  action: AdjustAction;
}) {
  const [state, formAction, pending] = useActionState(action, initState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Ajouter un ajustement</h3>

      {state.error && (
        <p className="rounded bg-red-50 p-2 text-xs text-red-700">{state.error}</p>
      )}

      <input type="hidden" name="entryId" value={entryId} />

      <div>
        <label className="block text-xs font-medium text-gray-700">
          {"Montant de l'ajustement (centimes)"}
        </label>
        <p className="mb-1 text-xs text-gray-400">
          Positif = bonus (ex : 500 = +5,00 €). Négatif = correction (ex : -200 = −2,00 €).
        </p>
        <input
          name="deltaCents"
          type="number"
          required
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="ex : 300"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">
          Raison (min. 10 caractères)
        </label>
        <input
          name="reason"
          type="text"
          required
          minLength={10}
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ex : Erreur de calcul sur prestation annulée partiellement."
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {pending ? "Enregistrement..." : "Appliquer l'ajustement"}
      </button>
    </form>
  );
}
