"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { SupplierView, SupplierFormState } from "../types";

type Props = {
  supplier: SupplierView;
  deactivateAction: (prev: SupplierFormState, formData: FormData) => Promise<SupplierFormState>;
};

export function SupplierDetail({ supplier, deactivateAction }: Props) {
  const [state, dispatch, isPending] = useActionState(deactivateAction, null);

  return (
    <div className="space-y-6">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="rounded-md border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{supplier.name}</h2>
          {supplier.isActive ? (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Actif
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              Inactif
            </span>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-500">Contact</dt>
            <dd className="text-gray-900">{supplier.contactName ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Email</dt>
            <dd className="text-gray-900">{supplier.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Téléphone</dt>
            <dd className="text-gray-900">{supplier.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Adresse</dt>
            <dd className="text-gray-900">{supplier.address ?? "—"}</dd>
          </div>
          {supplier.notes && (
            <div className="col-span-2">
              <dt className="font-medium text-gray-500">Notes</dt>
              <dd className="whitespace-pre-wrap text-gray-900">{supplier.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/dashboard/suppliers/${supplier.id}/edit`}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Modifier
        </Link>
        {supplier.isActive && (
          <form action={dispatch}>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isPending ? "…" : "Désactiver"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
