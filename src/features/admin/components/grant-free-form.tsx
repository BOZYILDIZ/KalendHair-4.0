"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/features/admin/types";

type Action = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

const initialState: AdminActionState = {};

export function GrantFreeForm({
  orgId,
  isFree,
  freeReason,
  grantAction,
  revokeAction,
}: {
  orgId: string;
  isFree: boolean;
  freeReason: string | null;
  grantAction: Action;
  revokeAction: Action;
}) {
  const [grantState, grantFormAction, grantPending] = useActionState(
    grantAction,
    initialState,
  );
  const [revokeState, revokeFormAction, revokePending] = useActionState(
    revokeAction,
    initialState,
  );

  return (
    <div className="space-y-4">
      {isFree && freeReason && (
        <div className="rounded bg-emerald-50 p-3 text-sm text-emerald-700">
          <strong>Plan gratuit actif :</strong> {freeReason}
        </div>
      )}

      {!isFree ? (
        <form action={grantFormAction} className="space-y-3">
          <input type="hidden" name="orgId" value={orgId} />
          {grantState.error && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-700">
              {grantState.error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Raison du plan gratuit{" "}
              <span className="text-gray-400">(min. 10 caractères)</span>
            </label>
            <textarea
              name="reason"
              rows={2}
              required
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: Client partenaire — accord commercial."
            />
          </div>
          <button
            type="submit"
            disabled={grantPending}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {grantPending ? "Attribution..." : "Attribuer plan gratuit"}
          </button>
        </form>
      ) : (
        <form action={revokeFormAction} className="space-y-3">
          <input type="hidden" name="orgId" value={orgId} />
          {revokeState.error && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-700">
              {revokeState.error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Raison de la révocation{" "}
              <span className="text-gray-400">(min. 10 caractères)</span>
            </label>
            <textarea
              name="reason"
              rows={2}
              required
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex: Fin de la période partenaire accordée."
            />
          </div>
          <button
            type="submit"
            disabled={revokePending}
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {revokePending ? "Révocation..." : "Révoquer plan gratuit"}
          </button>
        </form>
      )}
    </div>
  );
}
