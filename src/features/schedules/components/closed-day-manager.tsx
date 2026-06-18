"use client";

import { useActionState } from "react";
import type { ClosedDayView, ClosedDayFormState } from "../types";

type Props = {
  closedDays: ClosedDayView[];
  addAction: (prevState: ClosedDayFormState, formData: FormData) => Promise<ClosedDayFormState>;
  removeAction: (formData: FormData) => Promise<void>;
};

export function ClosedDayManager({ closedDays, addAction, removeAction }: Props) {
  const [state, formAction, isPending] = useActionState(addAction, null);

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form action={formAction} className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Ajouter un jour de fermeture</h3>

        {state?.success && (
          <p className="rounded bg-green-50 px-4 py-2 text-sm text-green-700">
            {state.message}
          </p>
        )}
        {state && !state.success && state.message && (
          <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-700">
            {state.message}
          </p>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Date</label>
            <input
              type="date"
              name="date"
              required
              className="rounded border px-2 py-1 text-sm"
            />
            {state?.errors?.date?.[0] && (
              <p className="mt-1 text-xs text-red-600">{state.errors.date[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">Motif (optionnel)</label>
            <input
              type="text"
              name="reason"
              maxLength={200}
              placeholder="ex: jour férié"
              className="rounded border px-2 py-1 text-sm"
            />
            {state?.errors?.reason?.[0] && (
              <p className="mt-1 text-xs text-red-600">{state.errors.reason[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Ajout…" : "Ajouter"}
          </button>
        </div>
      </form>

      {/* List */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Jours de fermeture</h3>
        {closedDays.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun jour de fermeture enregistré.</p>
        ) : (
          <ul className="divide-y rounded border">
            {closedDays.map((cd) => (
              <li key={cd.id} className="flex items-center justify-between px-4 py-2">
                <span className="text-sm">
                  {cd.date instanceof Date
                    ? cd.date.toISOString().split("T")[0]
                    : String(cd.date)}
                  {cd.reason && (
                    <span className="ml-2 text-gray-400">— {cd.reason}</span>
                  )}
                </span>
                <form action={removeAction}>
                  <input type="hidden" name="closedDayId" value={cd.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
