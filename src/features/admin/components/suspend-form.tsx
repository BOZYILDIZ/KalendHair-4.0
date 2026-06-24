"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/features/admin/types";

type Action = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

const initialState: AdminActionState = {};

export function SuspendForm({
  orgId,
  action,
}: {
  orgId: string;
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orgId" value={orgId} />
      {state.error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Raison de la suspension{" "}
          <span className="text-gray-400">(min. 10 caractères)</span>
        </label>
        <textarea
          name="reason"
          rows={3}
          required
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: Activité frauduleuse détectée sur le compte."
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "Suspension..." : "Suspendre cette organisation"}
      </button>
    </form>
  );
}
