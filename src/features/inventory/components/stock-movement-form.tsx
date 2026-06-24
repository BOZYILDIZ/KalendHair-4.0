"use client";

import { useActionState } from "react";

type State = { error?: string } | null;

type Props = {
  productId: string;
  productName: string;
  currentStock: number | null;
  action: (prevState: State, formData: FormData) => Promise<State>;
  mode: "entry" | "usage" | "adjust";
};

const LABELS = {
  entry:  { title: "Enregistrer une entrée stock",   qty: "Quantité reçue",      submit: "Enregistrer l'entrée" },
  usage:  { title: "Enregistrer une utilisation",    qty: "Quantité utilisée",    submit: "Enregistrer l'utilisation" },
  adjust: { title: "Ajuster le stock",               qty: "Nouveau stock réel",   submit: "Ajuster le stock" },
};

export function StockMovementForm({ productId, productName, currentStock, action, mode }: Props) {
  const [state, dispatch, isPending] = useActionState(action, null);
  const labels = LABELS[mode];

  return (
    <form action={dispatch} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <input type="hidden" name="productId" value={productId} />

      <p className="text-sm text-gray-600">
        Produit : <span className="font-medium">{productName}</span>
        {currentStock !== null && (
          <> — stock actuel : <span className="font-medium">{currentStock}</span></>
        )}
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {labels.qty} <span className="text-red-500">*</span>
        </label>
        <input
          name="quantity"
          type="number"
          min={mode === "adjust" ? 0 : 1}
          required
          defaultValue={mode === "adjust" ? (currentStock ?? 0) : ""}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {mode === "entry" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Prix de revient unitaire (€)
          </label>
          <input
            name="costPriceCents"
            type="number"
            step="0.01"
            min={0}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

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
          {isPending ? "En cours…" : labels.submit}
        </button>
      </div>
    </form>
  );
}
