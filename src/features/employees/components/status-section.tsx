"use client";

import { useActionState } from "react";
import type { EmployeeFormState } from "../types";

type Props = {
  employeeId: string;
  isActive: boolean;
  deactivateAction: (
    prevState: EmployeeFormState,
    formData: FormData,
  ) => Promise<EmployeeFormState>;
  reactivateAction: (
    prevState: EmployeeFormState,
    formData: FormData,
  ) => Promise<EmployeeFormState>;
};

export function StatusSection({
  employeeId,
  isActive,
  deactivateAction,
  reactivateAction,
}: Props) {
  const [state, formAction, pending] = useActionState<EmployeeFormState, FormData>(
    isActive ? deactivateAction : reactivateAction,
    null,
  );

  if (state?.requireConfirmation && state.warning) {
    return (
      <div className="rounded border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
        <p className="mb-3 font-medium">{state.warning}</p>
        <div className="flex gap-3">
          <a
            href={`/dashboard/employees/${employeeId}`}
            className="rounded border border-orange-300 bg-white px-3 py-1.5 text-sm hover:bg-orange-50"
          >
            Annuler
          </a>
          <form action={formAction}>
            <input type="hidden" name="employeeId" value={employeeId} />
            <input type="hidden" name="confirmed" value="true" />
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {pending ? "Enregistrement…" : "Réactiver quand même"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (state?.success) {
    return (
      <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
        Statut mis à jour.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {state?.message && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}
      <form action={formAction}>
        <input type="hidden" name="employeeId" value={employeeId} />
        {isActive ? (
          <button
            type="submit"
            disabled={pending}
            className="rounded border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {pending ? "En cours…" : "Désactiver cet employé"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {pending ? "En cours…" : "Réactiver cet employé"}
          </button>
        )}
      </form>
    </div>
  );
}
