"use client";

import { useActionState } from "react";
import type { ProductCategoryView, ProductView } from "../types";

type State = { error?: string } | null;

type Props = {
  categories: ProductCategoryView[];
  product?: ProductView;
  action: (prevState: State, formData: FormData) => Promise<State>;
  submitLabel: string;
};

export function ProductForm({ categories, product, action, submitLabel }: Props) {
  const [state, dispatch, isPending] = useActionState(action, null);

  return (
    <form action={dispatch} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          required
          defaultValue={product?.name ?? ""}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Catégorie</label>
        <select
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Aucune —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Unité <span className="text-red-500">*</span>
          </label>
          <input
            name="unit"
            required
            defaultValue={product?.unit ?? "unité"}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Seuil alerte stock
          </label>
          <input
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={product?.lowStockThreshold ?? 5}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Prix de vente (€) <span className="text-red-500">*</span>
          </label>
          <input
            name="priceCents"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Prix de revient (€)
          </label>
          <input
            name="costPriceCents"
            type="number"
            step="0.01"
            min={0}
            defaultValue={
              product?.costPriceCents != null
                ? (product.costPriceCents / 100).toFixed(2)
                : ""
            }
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "En cours…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
