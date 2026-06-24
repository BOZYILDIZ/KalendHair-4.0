"use client";

import { useActionState } from "react";

type State = { error?: string } | null;

type Props = {
  action: (prevState: State, formData: FormData) => Promise<State>;
};

export function DeactivateProductButton({ action }: Props) {
  const [state, dispatch, isPending] = useActionState(action, null);

  return (
    <form action={dispatch}>
      {state?.error && (
        <p className="mb-3 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? "En cours…" : "Désactiver ce produit"}
      </button>
    </form>
  );
}
