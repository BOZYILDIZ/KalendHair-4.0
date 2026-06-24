"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/features/admin/types";

type Action = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

const initialState: AdminActionState = {};

export function CreateDiscountForm({
  orgId,
  subscriptionId,
  action,
}: {
  orgId: string;
  subscriptionId: string;
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orgId" value={orgId} />
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      {state.error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type de remise
          </label>
          <select
            name="type"
            className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="PERCENT">Pourcentage (%)</option>
            <option value="FIXED_AMOUNT">Montant fixe (centimes)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valeur
          </label>
          <input
            type="number"
            name="value"
            min={1}
            required
            className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="20 ou 1000 (centimes)"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de début
          </label>
          <input
            type="datetime-local"
            name="startDate"
            required
            className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de fin <span className="text-gray-400">(optionnel)</span>
          </label>
          <input
            type="datetime-local"
            name="endDate"
            className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Raison <span className="text-gray-400">(min. 10 caractères)</span>
        </label>
        <textarea
          name="reason"
          rows={2}
          required
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Ex: Remise commerciale accordée lors du salon professionnel."
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {pending ? "Création..." : "Créer la remise"}
      </button>
    </form>
  );
}
