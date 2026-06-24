"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { PurchaseOrderView, PurchaseOrderFormState } from "../types";
import { PurchaseOrderStatusBadge } from "./purchase-order-status-badge";
import { ReceiptHistoryTable } from "./receipt-history-table";

type Props = {
  order: PurchaseOrderView;
  sendAction: (prev: PurchaseOrderFormState, formData: FormData) => Promise<PurchaseOrderFormState>;
  cancelAction: (prev: PurchaseOrderFormState, formData: FormData) => Promise<PurchaseOrderFormState>;
};

export function PurchaseOrderDetail({ order, sendAction, cancelAction }: Props) {
  const [sendState, sendDispatch, isSendPending]     = useActionState(sendAction, null);
  const [cancelState, cancelDispatch, isCancelPending] = useActionState(cancelAction, null);

  const canSend   = order.status === "DRAFT" && order.lines.length > 0;
  const canCancel = order.status === "DRAFT" || order.status === "SENT";
  const canReceive = order.status === "SENT" || order.status === "PARTIALLY_RECEIVED";

  const error = sendState?.error ?? cancelState?.error;

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* Header */}
      <div className="rounded-md border p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {order.reference ?? "Sans référence"}
              </h2>
              <PurchaseOrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">Fournisseur : {order.supplierName}</p>
          </div>

          <div className="flex gap-2">
            {canReceive && (
              <Link
                href={`/dashboard/purchase-orders/${order.id}/receive`}
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
              >
                Réceptionner
              </Link>
            )}
            {canSend && (
              <form action={sendDispatch}>
                <button
                  type="submit"
                  disabled={isSendPending}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSendPending ? "…" : "Marquer comme envoyé"}
                </button>
              </form>
            )}
            {canCancel && (
              <form action={cancelDispatch}>
                <button
                  type="submit"
                  disabled={isCancelPending}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isCancelPending ? "…" : "Annuler"}
                </button>
              </form>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-gray-500">Livraison prévue</dt>
            <dd className="font-medium text-gray-900">
              {order.expectedAt
                ? new Date(order.expectedAt).toLocaleDateString("fr-FR")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Total commandé</dt>
            <dd className="font-medium text-gray-900">
              {(order.totalOrderedCents / 100).toLocaleString("fr-FR", {
                style: "currency", currency: "EUR",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Créé par</dt>
            <dd className="font-medium text-gray-900">{order.createdByName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Créé le</dt>
            <dd className="font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleDateString("fr-FR")}
            </dd>
          </div>
        </dl>

        {order.notes && (
          <p className="mt-3 text-sm text-gray-600">{order.notes}</p>
        )}
      </div>

      {/* Lines */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Lignes de commande</h3>
          {order.status === "DRAFT" && (
            <Link
              href={`/dashboard/purchase-orders/${order.id}/lines`}
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter / modifier les lignes
            </Link>
          )}
        </div>

        {order.lines.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
            Aucune ligne.{" "}
            {order.status === "DRAFT" && (
              <Link href={`/dashboard/purchase-orders/${order.id}/lines`} className="text-blue-600 hover:underline">
                Ajouter des lignes
              </Link>
            )}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Produit</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Commandé</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Reçu</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Reste</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Coût unit.</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {order.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {l.productName}
                      <span className="ml-1 text-xs text-gray-400">({l.productUnit})</span>
                    </td>
                    <td className="px-4 py-3 text-right">{l.quantityOrdered}</td>
                    <td className="px-4 py-3 text-right text-green-700">{l.quantityReceived}</td>
                    <td className={`px-4 py-3 text-right font-medium ${l.quantityRemaining > 0 ? "text-orange-600" : "text-gray-400"}`}>
                      {l.quantityRemaining}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(l.unitCostCents / 100).toLocaleString("fr-FR", {
                        style: "currency", currency: "EUR",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {(l.totalCostCents / 100).toLocaleString("fr-FR", {
                        style: "currency", currency: "EUR",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt history */}
      {order.receipts.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium text-gray-900">Historique des réceptions</h3>
          <ReceiptHistoryTable receipts={order.receipts} />
        </div>
      )}
    </div>
  );
}
