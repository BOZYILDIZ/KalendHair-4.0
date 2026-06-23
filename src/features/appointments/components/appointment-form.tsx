"use client";

import { useActionState, useState } from "react";
import type { AppointmentFormState, EmployeeBasicView, ServiceBasicView } from "../types";

type Props = {
  services: ServiceBasicView[];
  serviceEmployees: Record<string, EmployeeBasicView[]>;
  action: (prevState: AppointmentFormState, formData: FormData) => Promise<AppointmentFormState>;
  existingAppointment?: {
    employeeId:     string;
    serviceId:      string;
    date:           string;
    startTime:      string;
    guestFirstName: string;
    guestLastName:  string;
    guestEmail:     string | null;
    guestPhone:     string | null;
    notes:          string | null;
  };
  submitLabel?: string;
};

export function AppointmentForm({
  services,
  serviceEmployees,
  action,
  existingAppointment,
  submitLabel = "Créer le rendez-vous",
}: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  const [selectedServiceId, setSelectedServiceId] = useState(
    existingAppointment?.serviceId ?? "",
  );

  const employeesForService = selectedServiceId
    ? (serviceEmployees[selectedServiceId] ?? [])
    : [];

  const f = (field: string) => state?.errors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && !state.success && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      )}
      {state?.success && state.message && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {state.message}
        </div>
      )}

      {/* Service + Employee */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-700">Prestation</legend>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Service <span className="text-red-500">*</span>
          </label>
          <select
            name="serviceId"
            required
            defaultValue={existingAppointment?.serviceId ?? ""}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">— Choisir un service —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.durationMinutes} min — {(s.priceCents / 100).toFixed(2)} €)
              </option>
            ))}
          </select>
          {f("serviceId") && (
            <p className="mt-1 text-xs text-red-600">{f("serviceId")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employé <span className="text-red-500">*</span>
          </label>
          <select
            name="employeeId"
            required
            defaultValue={existingAppointment?.employeeId ?? ""}
            disabled={employeesForService.length === 0}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          >
            <option value="">
              {employeesForService.length === 0
                ? "Sélectionnez d'abord un service"
                : "— Choisir un employé —"}
            </option>
            {employeesForService.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
          {f("employeeId") && (
            <p className="mt-1 text-xs text-red-600">{f("employeeId")}</p>
          )}
        </div>
      </fieldset>

      {/* Date + Time */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-700">Date et heure</legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              defaultValue={existingAppointment?.date ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {f("date") && <p className="mt-1 text-xs text-red-600">{f("date")}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Heure de début <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="startTime"
              required
              defaultValue={existingAppointment?.startTime ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {f("startTime") && (
              <p className="mt-1 text-xs text-red-600">{f("startTime")}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Guest info */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-700">Informations client</legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="guestFirstName"
              required
              maxLength={100}
              defaultValue={existingAppointment?.guestFirstName ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {f("guestFirstName") && (
              <p className="mt-1 text-xs text-red-600">{f("guestFirstName")}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="guestLastName"
              required
              maxLength={100}
              defaultValue={existingAppointment?.guestLastName ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {f("guestLastName") && (
              <p className="mt-1 text-xs text-red-600">{f("guestLastName")}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="guestEmail"
            maxLength={255}
            defaultValue={existingAppointment?.guestEmail ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {f("guestEmail") && (
            <p className="mt-1 text-xs text-red-600">{f("guestEmail")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            name="guestPhone"
            maxLength={30}
            defaultValue={existingAppointment?.guestPhone ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {f("guestPhone") && (
            <p className="mt-1 text-xs text-red-600">{f("guestPhone")}</p>
          )}
        </div>
      </fieldset>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes internes</label>
        <textarea
          name="notes"
          rows={3}
          maxLength={1000}
          defaultValue={existingAppointment?.notes ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {f("notes") && <p className="mt-1 text-xs text-red-600">{f("notes")}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
