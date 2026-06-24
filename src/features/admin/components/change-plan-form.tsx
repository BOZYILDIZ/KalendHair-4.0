"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/features/admin/types";
import type { BillingCycle, SubscriptionPlanCode } from "@prisma/client";

type Action = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

const initialState: AdminActionState = {};

export function ChangePlanForm({
  orgId,
  currentPlanCode,
  currentBillingCycle,
  action,
}: {
  orgId: string;
  currentPlanCode: SubscriptionPlanCode | null;
  currentBillingCycle: BillingCycle | null;
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orgId" value={orgId} />
      {state.error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded bg-green-50 p-2 text-sm text-green-700">
          {state.success}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Plan</label>
          <select
            name="planCode"
            defaultValue={currentPlanCode ?? "ESSENTIAL"}
            className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ESSENTIAL">Essential</option>
            <option value="PRO">Pro</option>
            <option value="BUSINESS">Business</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cycle de facturation
          </label>
          <select
            name="billingCycle"
            defaultValue={currentBillingCycle ?? "MONTHLY"}
            className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MONTHLY">Mensuel</option>
            <option value="YEARLY">Annuel</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Raison <span className="text-gray-400">(min. 10 caractères)</span>
        </label>
        <textarea
          name="reason"
          rows={2}
          required
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Mise à niveau demandée par le client."
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Modification..." : "Appliquer le changement de plan"}
      </button>
    </form>
  );
}
