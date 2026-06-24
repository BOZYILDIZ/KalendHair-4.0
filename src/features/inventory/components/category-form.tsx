"use client";

import { useActionState } from "react";

type State = { error?: string } | null;

type Props = {
  action: (prevState: State, formData: FormData) => Promise<State>;
};

export function CategoryForm({ action }: Props) {
  const [state, dispatch, isPending] = useActionState(action, null);

  return (
    <form action={dispatch} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nom de la catégorie <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          required
          maxLength={100}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ex: Colorants, Soins, Accessoires…"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "En cours…" : "Créer la catégorie"}
        </button>
      </div>
    </form>
  );
}
