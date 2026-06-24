"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/features/admin/types";
import type { DiscountType } from "@prisma/client";

type Discount = {
  id: string;
  type: DiscountType;
  value: number;
  reason: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  createdByAdminId: string;
};

type DeactivateAction = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

const initialState: AdminActionState = {};

function DeactivateButton({
  orgId,
  discountId,
  action,
}: {
  orgId: string;
  discountId: string;
  action: DeactivateAction;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orgId" value={orgId} />
      <input type="hidden" name="discountId" value={discountId} />
      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      <input
        type="text"
        name="reason"
        required
        placeholder="Raison (min. 10 caractères)"
        className="w-full rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 disabled:opacity-50"
      >
        {pending ? "..." : "Désactiver"}
      </button>
    </form>
  );
}

export function DiscountList({
  orgId,
  discounts,
  deactivateAction,
}: {
  orgId: string;
  discounts: Discount[];
  deactivateAction: DeactivateAction;
}) {
  if (discounts.length === 0) {
    return <p className="text-sm text-gray-400">Aucune remise.</p>;
  }

  return (
    <div className="space-y-3">
      {discounts.map((d) => (
        <div
          key={d.id}
          className={`rounded border p-4 ${d.isActive ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {d.type === "PERCENT"
                    ? `${d.value}%`
                    : `${(d.value / 100).toFixed(2)} €`}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    d.isActive
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {d.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-500">{d.reason}</p>
              <p className="text-xs text-gray-400">
                Du {d.startDate.toLocaleDateString("fr-FR")}{" "}
                {d.endDate
                  ? `au ${d.endDate.toLocaleDateString("fr-FR")}`
                  : "(indéterminée)"}
              </p>
            </div>
            {d.isActive && (
              <DeactivateButton
                orgId={orgId}
                discountId={d.id}
                action={deactivateAction}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
