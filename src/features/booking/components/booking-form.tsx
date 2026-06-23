"use client";

import { useActionState } from "react";
import type { PublicBookingFormState } from "../types";

type Props = {
  bookingAction: (
    _prevState: PublicBookingFormState,
    formData: FormData,
  ) => Promise<PublicBookingFormState>;
  serviceId: string;
  employeeId: string;
  date: string;
  slot: string;
};

export function BookingForm({ bookingAction, serviceId, employeeId, date, slot }: Props) {
  const [state, formAction, isPending] = useActionState(bookingAction, { success: false });

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="slot" value={slot} />

      {state.error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Prénom *</label>
        <input
          type="text"
          name="firstName"
          required
          maxLength={100}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nom *</label>
        <input
          type="text"
          name="lastName"
          required
          maxLength={100}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email *</label>
        <input
          type="email"
          name="email"
          required
          maxLength={255}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
        <input
          type="tel"
          name="phone"
          maxLength={20}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isPending ? "Réservation en cours…" : "Confirmer le rendez-vous"}
      </button>
    </form>
  );
}
