"use client";

import { useActionState } from "react";
import type { EmployeeView, EmployeeFormState } from "../types";

type Props = {
  employee?: EmployeeView;
  action: (
    prevState: EmployeeFormState,
    formData: FormData,
  ) => Promise<EmployeeFormState>;
};

export function EmployeeForm({ employee, action }: Props) {
  const [state, formAction, pending] = useActionState<
    EmployeeFormState,
    FormData
  >(action, null);

  // Valeurs affichées : données en attente (si warning) > données existantes > vide
  const displayValues = state?.pendingData ?? {
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    email: employee?.email ?? "",
    phone: employee?.phone ?? "",
    color: employee?.color ?? "#6366f1",
  };

  return (
    <div className="space-y-6">
      {state?.success && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Employé enregistré.
        </p>
      )}
      {state?.message && !state.success && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      {state?.requireConfirmation && state.warning && state.pendingData && (
        <div className="rounded border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <p className="mb-3 font-medium">{state.warning}</p>
          <div className="flex gap-3">
            <a
              href={
                employee
                  ? `/dashboard/employees/${employee.id}`
                  : "/dashboard/employees/new"
              }
              className="rounded border border-orange-300 bg-white px-3 py-1.5 text-sm hover:bg-orange-50"
            >
              Annuler
            </a>
            <form action={formAction}>
              <input type="hidden" name="confirmed" value="true" />
              <input type="hidden" name="firstName" value={state.pendingData.firstName} />
              <input type="hidden" name="lastName" value={state.pendingData.lastName} />
              <input type="hidden" name="email" value={state.pendingData.email} />
              <input type="hidden" name="phone" value={state.pendingData.phone} />
              <input type="hidden" name="color" value={state.pendingData.color} />
              <button
                type="submit"
                disabled={pending}
                className="rounded bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {pending ? "Enregistrement…" : "Confirmer quand même"}
              </button>
            </form>
          </div>
        </div>
      )}

      {!state?.requireConfirmation && (
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="firstName" className="block text-sm font-medium">
              Prénom *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              defaultValue={displayValues.firstName}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {state?.errors?.firstName && (
              <p className="text-xs text-red-600">
                {state.errors.firstName[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="lastName" className="block text-sm font-medium">
              Nom *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              defaultValue={displayValues.lastName}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {state?.errors?.lastName && (
              <p className="text-xs text-red-600">
                {state.errors.lastName[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={displayValues.email}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {state?.errors?.email && (
              <p className="text-xs text-red-600">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium">
              Téléphone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={displayValues.phone}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {state?.errors?.phone && (
              <p className="text-xs text-red-600">{state.errors.phone[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="color" className="block text-sm font-medium">
              Couleur agenda
            </label>
            <input
              id="color"
              name="color"
              type="color"
              defaultValue={displayValues.color}
              className="h-9 w-16 cursor-pointer rounded border px-1 py-1"
            />
            {state?.errors?.color && (
              <p className="text-xs text-red-600">{state.errors.color[0]}</p>
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
      )}
    </div>
  );
}
