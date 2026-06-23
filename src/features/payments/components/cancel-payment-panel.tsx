"use client";

import { useActionState } from "react";
import type { PaymentFormState } from "../types";

type Props = {
  action: (prev: PaymentFormState, fd: FormData) => Promise<PaymentFormState>;
};

export function CancelPaymentPanel({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  if (state.success) {
    return (
      <div className="rounded-md bg-orange-50 p-4 text-sm text-orange-800">
        Paiement annulé.
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-red-100 bg-white p-5">
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Annuler ce paiement</h2>
      {state.error && (
        <p className="mb-3 text-sm text-red-700">{state.error}</p>
      )}
      <p className="mb-4 text-sm text-gray-500">
        Cette action est irréversible. Le paiement sera marqué comme annulé.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        onClick={(e) => {
          if (!confirm("Confirmer l'annulation de ce paiement ?")) e.preventDefault();
        }}
      >
        {pending ? "Annulation..." : "Annuler ce paiement"}
      </button>
    </form>
  );
}
