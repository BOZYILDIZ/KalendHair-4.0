"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/features/admin/types";

type Action = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

const initialState: AdminActionState = {};

export function AddNoteForm({
  orgId,
  action,
}: {
  orgId: string;
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orgId" value={orgId} />
      {state.error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nouvelle note interne
        </label>
        <textarea
          name="content"
          rows={3}
          required
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Client obtenu via campagne Facebook."
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Ajout..." : "Ajouter la note"}
      </button>
    </form>
  );
}
