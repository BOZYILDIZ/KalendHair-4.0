"use client";

import { useActionState } from "react";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import {
  ALLOWED_TRANSITIONS,
  STATUS_LABELS,
  type AppointmentDetailView,
  type AppointmentModificationType,
  type CancelFormState,
  type StatusFormState,
} from "../types";

const MOD_LABELS: Record<AppointmentModificationType, string> = {
  CREATED:        "Créé",
  RESCHEDULED:    "Replanifié",
  CANCELLED:      "Annulé",
  STATUS_CHANGED: "Statut modifié",
  NOTE_UPDATED:   "Note modifiée",
};

type Props = {
  appointment: AppointmentDetailView;
  salonTimezone: string;
  updateStatusAction: (
    prevState: StatusFormState,
    formData: FormData,
  ) => Promise<StatusFormState>;
  cancelAction: (
    prevState: CancelFormState,
    formData: FormData,
  ) => Promise<CancelFormState>;
  convertGuestAction?: (formData: FormData) => Promise<void>;
};

function formatDatetime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    day:    "2-digit",
    month:  "long",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    hour:   "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

export function AppointmentDetail({
  appointment,
  salonTimezone,
  updateStatusAction,
  cancelAction,
  convertGuestAction,
}: Props) {
  const [statusState, statusFormAction, statusPending] = useActionState(
    updateStatusAction,
    null,
  );
  const [cancelState, cancelFormAction, cancelPending] = useActionState(
    cancelAction,
    null,
  );

  const nextStatuses = ALLOWED_TRANSITIONS[appointment.status].filter(
    (s) => s !== "CANCELLED",
  );
  const canCancel = ALLOWED_TRANSITIONS[appointment.status].includes("CANCELLED");

  return (
    <div className="space-y-8">
      {/* Summary */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Détails du rendez-vous</h2>
          <AppointmentStatusBadge status={appointment.status} />
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-gray-400">Date et heure</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDatetime(appointment.startAt, salonTimezone)}
              {" – "}
              {formatTime(appointment.endAt, salonTimezone)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-400">Service</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {appointment.service.name}{" "}
              <span className="text-gray-500">
                ({appointment.service.durationMinutes} min —{" "}
                {(appointment.service.priceCents / 100).toFixed(2)} €)
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-400">Employé</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {appointment.employee.firstName} {appointment.employee.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-400">Client</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {appointment.guestFirstName} {appointment.guestLastName}
              {appointment.guestEmail && (
                <div className="text-xs text-gray-500">{appointment.guestEmail}</div>
              )}
              {appointment.guestPhone && (
                <div className="text-xs text-gray-500">{appointment.guestPhone}</div>
              )}
              {appointment.clientId === null && appointment.guestEmail && convertGuestAction && (
                <form action={convertGuestAction} className="mt-2">
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <button
                    type="submit"
                    className="rounded border border-indigo-300 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                  >
                    Lier ce client au CRM →
                  </button>
                </form>
              )}
            </dd>
          </div>
          {appointment.notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-gray-400">Notes</dt>
              <dd className="mt-1 text-sm text-gray-700">{appointment.notes}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Status actions */}
      {(nextStatuses.length > 0 || canCancel) && (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Actions</h2>

          {statusState?.message && (
            <div
              className={`mb-4 rounded-md p-3 text-sm ${statusState.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {statusState.message}
            </div>
          )}

          {nextStatuses.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <form key={s} action={statusFormAction}>
                  <input type="hidden" name="newStatus" value={s} />
                  <button
                    type="submit"
                    disabled={statusPending}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {statusPending ? "…" : STATUS_LABELS[s]}
                  </button>
                </form>
              ))}
            </div>
          )}

          {canCancel && (
            <form action={cancelFormAction} className="space-y-3">
              {cancelState?.message && (
                <div
                  className={`rounded-md p-3 text-sm ${cancelState.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  {cancelState.message}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Motif d&apos;annulation (optionnel)
                </label>
                <input
                  type="text"
                  name="reason"
                  maxLength={500}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={cancelPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelPending ? "Annulation…" : "Annuler le rendez-vous"}
              </button>
            </form>
          )}
        </section>
      )}

      {/* Modification history */}
      {appointment.modifications.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Historique</h2>
          <ol className="space-y-3">
            {appointment.modifications.map((mod) => (
              <li key={mod.id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {mod.modificationType[0]}
                </span>
                <div>
                  <span className="font-medium text-gray-800">
                    {MOD_LABELS[mod.modificationType]}
                  </span>
                  {mod.previousStartAt && (
                    <span className="ml-2 text-gray-500">
                      (était : {formatDateShort(mod.previousStartAt)})
                    </span>
                  )}
                  {mod.previousStatus && (
                    <span className="ml-2 text-gray-500">
                      (était : {STATUS_LABELS[mod.previousStatus]})
                    </span>
                  )}
                  {mod.note && (
                    <div className="mt-0.5 text-gray-500 italic">{mod.note}</div>
                  )}
                  <div className="text-xs text-gray-400">
                    {formatDateShort(mod.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
