"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ServiceView } from "@/features/services/types";

type AssignmentState = {
  success?: boolean;
  message?: string;
} | null;

type Props = {
  employeeIsActive: boolean;
  salonServices: ServiceView[];
  assignedServiceIds: string[];
  action: (
    prevState: AssignmentState,
    formData: FormData,
  ) => Promise<AssignmentState>;
};

export function ServiceAssignment({
  employeeIsActive,
  salonServices,
  assignedServiceIds,
  action,
}: Props) {
  const [state, formAction, pending] = useActionState<AssignmentState, FormData>(
    action,
    null,
  );

  const activeServices = salonServices.filter((s) => s.isActive);

  if (activeServices.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Aucun service actif dans ce salon.{" "}
        <Link href="/dashboard/services/new" className="underline">
          Créer un service
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {state?.success && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Associations enregistrées.
        </p>
      )}
      {state?.message && !state.success && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <form action={formAction} className="space-y-3">
        {activeServices.map((service) => (
          <label
            key={service.id}
            className="flex cursor-pointer items-center gap-3 rounded border px-4 py-3 text-sm hover:bg-gray-50"
          >
            <input
              type="checkbox"
              name="serviceIds"
              value={service.id}
              defaultChecked={assignedServiceIds.includes(service.id)}
              disabled={!employeeIsActive}
              className="h-4 w-4"
            />
            <span className={!employeeIsActive ? "text-gray-400" : ""}>
              {service.name}
              <span className="ml-2 text-gray-400">
                {service.durationMinutes} min ·{" "}
                {(service.priceCents / 100).toFixed(2)} €
              </span>
            </span>
          </label>
        ))}

        {employeeIsActive && (
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Enregistrement…" : "Enregistrer les associations"}
          </button>
        )}
      </form>

      {!employeeIsActive && (
        <p className="text-xs text-gray-400">
          Réactivez l&apos;employé pour modifier les associations.
        </p>
      )}
    </div>
  );
}
