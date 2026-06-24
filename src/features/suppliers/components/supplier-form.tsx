"use client";

import { useActionState } from "react";
import type { SupplierFormState } from "../types";

type Props = {
  action: (prev: SupplierFormState, formData: FormData) => Promise<SupplierFormState>;
  defaultValues?: {
    name?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  };
  submitLabel?: string;
};

export function SupplierForm({ action, defaultValues = {}, submitLabel = "Créer" }: Props) {
  const [state, dispatch, isPending] = useActionState(action, null);

  return (
    <form action={dispatch} className="space-y-5">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={200}
          defaultValue={defaultValues.name}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
          Nom du contact
        </label>
        <input
          id="contactName"
          name="contactName"
          type="text"
          maxLength={200}
          defaultValue={defaultValues.contactName ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={200}
            defaultValue={defaultValues.email ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={50}
            defaultValue={defaultValues.phone ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Adresse
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          maxLength={500}
          defaultValue={defaultValues.address ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes internes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={1000}
          defaultValue={defaultValues.notes ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
