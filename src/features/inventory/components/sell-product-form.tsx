"use client";

import { useActionState } from "react";
import type { ProductSummary } from "../types";

type State = { error?: string } | null;

type Props = {
  products: ProductSummary[];
  action: (prevState: State, formData: FormData) => Promise<State>;
};

const METHODS = [
  { value: "CASH",     label: "Espèces" },
  { value: "CARD",     label: "Carte bancaire" },
  { value: "TRANSFER", label: "Virement" },
  { value: "OTHER",    label: "Autre" },
];

export function SellProductForm({ products, action }: Props) {
  const [state, dispatch, isPending] = useActionState(action, null);

  return (
    <form action={dispatch} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Produit <span className="text-red-500">*</span>
        </label>
        <select
          name="productId"
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Choisir un produit —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id} disabled={p.currentStock === 0}>
              {p.name} — {(p.priceCents / 100).toFixed(2)} €
              {p.currentStock !== null ? ` (stock : ${p.currentStock})` : ""}
              {p.currentStock === 0 ? " — RUPTURE" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Quantité <span className="text-red-500">*</span>
          </label>
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mode de paiement <span className="text-red-500">*</span>
          </label>
          <select
            name="method"
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Client (optionnel)</label>
        <input
          name="guestName"
          type="text"
          placeholder="Nom du client"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          rows={2}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "En cours…" : "Encaisser la vente"}
        </button>
      </div>
    </form>
  );
}
