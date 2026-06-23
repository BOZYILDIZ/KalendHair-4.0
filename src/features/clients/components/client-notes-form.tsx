"use client";

import { useActionState } from "react";
import type { ClientNotesFormState } from "../types";

type Props = {
  clientId: string;
  initialNotes: string | null;
  action: (prev: ClientNotesFormState, data: FormData) => Promise<ClientNotesFormState>;
};

const initialState: ClientNotesFormState = { success: false };

export function ClientNotesForm({ clientId, initialNotes, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="clientId" value={clientId} />
      <label className="block text-xs font-medium text-gray-500">
        Notes internes — visibles uniquement par votre équipe, jamais par le client.
      </label>
      <textarea
        name="notes"
        defaultValue={initialNotes ?? ""}
        maxLength={500}
        rows={4}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        placeholder="Préférences, allergies, habitudes…"
      />
      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-600">Notes sauvegardées.</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : "Sauvegarder"}
      </button>
    </form>
  );
}
