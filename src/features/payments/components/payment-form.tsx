"use client";

import { useActionState } from "react";
import { FORM_PAYMENT_METHODS } from "../types";
import type { PaymentFormState } from "../types";

// ─── Appointment Payment Form ─────────────────────────────────────────────────

type AppointmentPaymentFormProps = {
  action:           (prev: PaymentFormState, fd: FormData) => Promise<PaymentFormState>;
  remainingEuros:   string; // pre-filled remaining amount in euros (e.g. "25.50")
  expectedEuros:    string; // displayed as context
  paidEuros:        string; // displayed as context
  serviceName:      string;
  isPaid:           boolean; // if already paid, show warning
};

export function AppointmentPaymentForm({
  action,
  remainingEuros,
  expectedEuros,
  paidEuros,
  serviceName,
  isPaid,
}: AppointmentPaymentFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  const todayISO = new Date().toISOString().slice(0, 16); // datetime-local format

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          Paiement enregistré avec succès.
        </div>
      )}

      {isPaid && !state.success && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
          Ce rendez-vous est déjà soldé. Vous pouvez enregistrer un paiement supplémentaire.
        </div>
      )}

      {/* Context */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm">
        <p className="font-medium text-gray-700">{serviceName}</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500">
          <span>Attendu : <strong className="text-gray-800">{expectedEuros} €</strong></span>
          <span>Encaissé : <strong className="text-gray-800">{paidEuros} €</strong></span>
          <span>Reste : <strong className="text-orange-700">{remainingEuros} €</strong></span>
        </div>
      </div>

      {/* Montant */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="amountEuros">
          Montant encaissé (€)
        </label>
        <input
          id="amountEuros"
          name="amountEuros"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={remainingEuros}
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Méthode */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Méthode de paiement
        </label>
        <div className="mt-2 flex gap-3">
          {FORM_PAYMENT_METHODS.map((m) => (
            <label key={m.value} className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="method"
                value={m.value}
                defaultChecked={m.value === "CASH"}
                className="accent-indigo-600"
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      {/* Date + heure */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="paidAt">
          Date et heure du paiement
        </label>
        <input
          id="paidAt"
          name="paidAt"
          type="datetime-local"
          defaultValue={todayISO}
          max={todayISO}
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="notes">
          Notes <span className="text-gray-400">(facultatif)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          maxLength={500}
          placeholder="Remarque sur ce paiement..."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending || state.success}
        className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Encaisser"}
      </button>
    </form>
  );
}

// ─── Free Payment Form ────────────────────────────────────────────────────────

type FreePaymentFormProps = {
  action: (prev: PaymentFormState, fd: FormData) => Promise<PaymentFormState>;
};

export function FreePaymentForm({ action }: FreePaymentFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  const todayISO = new Date().toISOString().slice(0, 16);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          Paiement libre enregistré avec succès.
        </div>
      )}

      {/* Ligne de prestation */}
      <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
        <legend className="text-sm font-semibold text-gray-700">Prestation</legend>

        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="lineLabel">
            Libellé
          </label>
          <input
            id="lineLabel"
            name="lineLabel"
            type="text"
            maxLength={200}
            required
            placeholder="Ex : Coupe femme"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="unitPriceEuros">
              Prix unitaire (€)
            </label>
            <input
              id="unitPriceEuros"
              name="unitPriceEuros"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="quantity">
              Quantité
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue="1"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </fieldset>

      {/* Montant total encaissé */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="amountEuros">
          Montant encaissé (€)
        </label>
        <input
          id="amountEuros"
          name="amountEuros"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Méthode */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Méthode de paiement
        </label>
        <div className="mt-2 flex gap-3">
          {FORM_PAYMENT_METHODS.map((m) => (
            <label key={m.value} className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="method"
                value={m.value}
                defaultChecked={m.value === "CASH"}
                className="accent-indigo-600"
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      {/* Date + heure */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="paidAt">
          Date et heure du paiement
        </label>
        <input
          id="paidAt"
          name="paidAt"
          type="datetime-local"
          defaultValue={todayISO}
          max={todayISO}
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Client / invité (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="guestName">
          Nom du client <span className="text-gray-400">(facultatif)</span>
        </label>
        <input
          id="guestName"
          name="guestName"
          type="text"
          maxLength={200}
          placeholder="Ex : Marie Dupont"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="notes">
          Notes <span className="text-gray-400">(facultatif)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          maxLength={500}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending || state.success}
        className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer le paiement"}
      </button>
    </form>
  );
}
