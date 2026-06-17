"use client";

import { useActionState } from "react";
import type { ServiceView, ServiceFormState } from "../types";

type Props = {
  service?: ServiceView;
  action: (
    prevState: ServiceFormState,
    formData: FormData,
  ) => Promise<ServiceFormState>;
};

export function ServiceForm({ service, action }: Props) {
  const [state, formAction, pending] = useActionState<ServiceFormState, FormData>(
    action,
    null,
  );

  const priceDefault =
    service ? (service.priceCents / 100).toFixed(2) : "";

  return (
    <div className="space-y-6">
      {state?.success && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Service enregistré.
        </p>
      )}
      {state?.message && !state.success && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium">
            Nom *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={service?.name ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {state?.errors?.name && (
            <p className="text-xs text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={service?.description ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {state?.errors?.description && (
            <p className="text-xs text-red-600">
              {state.errors.description[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="durationMinutes"
            className="block text-sm font-medium"
          >
            Durée (minutes) *
          </label>
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            required
            min={1}
            max={480}
            defaultValue={service?.durationMinutes ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {state?.errors?.durationMinutes && (
            <p className="text-xs text-red-600">
              {state.errors.durationMinutes[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="price" className="block text-sm font-medium">
            Prix (€)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            max={10000}
            step={0.01}
            defaultValue={priceDefault}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {state?.errors?.price && (
            <p className="text-xs text-red-600">{state.errors.price[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
