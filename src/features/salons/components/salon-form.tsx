"use client";

import { useActionState } from "react";
import type { SalonView, SalonFormState } from "../types";

const COMMON_TIMEZONES = [
  "Europe/Paris",
  "Europe/London",
  "Europe/Brussels",
  "Europe/Zurich",
  "America/Martinique",
  "America/Guadeloupe",
  "Indian/Reunion",
  "Indian/Mayotte",
  "Pacific/Tahiti",
  "Pacific/Noumea",
];

type Props = {
  salon: SalonView;
  action: (
    prevState: SalonFormState,
    formData: FormData,
  ) => Promise<SalonFormState>;
};

export function SalonForm({ salon, action }: Props) {
  const [state, formAction, pending] = useActionState<SalonFormState, FormData>(
    action,
    null,
  );

  return (
    <div className="space-y-6">
      {state?.success && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Salon mis à jour.
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
            Nom du salon
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={salon.name}
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
            defaultValue={salon.description ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {state?.errors?.description && (
            <p className="text-xs text-red-600">
              {state.errors.description[0]}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium">
              Téléphone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={salon.phone ?? ""}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {state?.errors?.phone && (
              <p className="text-xs text-red-600">{state.errors.phone[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="text"
              defaultValue={salon.email ?? ""}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {state?.errors?.email && (
              <p className="text-xs text-red-600">{state.errors.email[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="address" className="block text-sm font-medium">
            Adresse
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={salon.address ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {state?.errors?.address && (
            <p className="text-xs text-red-600">{state.errors.address[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="city" className="block text-sm font-medium">
              Ville
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={salon.city ?? ""}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {state?.errors?.city && (
              <p className="text-xs text-red-600">{state.errors.city[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="postalCode" className="block text-sm font-medium">
              Code postal
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              defaultValue={salon.postalCode ?? ""}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {state?.errors?.postalCode && (
              <p className="text-xs text-red-600">
                {state.errors.postalCode[0]}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="timezone" className="block text-sm font-medium">
            Fuseau horaire
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={salon.timezone}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          {state?.errors?.timezone && (
            <p className="text-xs text-red-600">{state.errors.timezone[0]}</p>
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

      <div className="border-t pt-4 text-sm text-gray-500">
        <p>
          <span className="font-medium">Slug :</span>{" "}
          <span className="font-mono">{salon.slug}</span>
        </p>
        <p>
          <span className="font-medium">Créé le :</span>{" "}
          {salon.createdAt.toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  );
}
