import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePayment } from "@/lib/permissions/payment.permissions";
import { getPayment } from "@/features/payments/payment.service";
import { PaymentMethodBadge } from "@/features/payments/components/payment-method-badge";
import { PaymentTransactionBadge } from "@/features/payments/components/payment-status-badge";
import { CancelPaymentPanel } from "@/features/payments/components/cancel-payment-panel";
import { cancelPaymentAction } from "./actions";
import type { PaymentFormState } from "@/features/payments/types";

type Props = {
  params: Promise<{ id: string }>;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

export default async function PaymentDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePayment(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const payment = await getPayment(salon.id, session.organizationId, id);
  if (!payment) notFound();

  const boundCancelAction = async (
    prev: PaymentFormState,
    formData: FormData,
  ): Promise<PaymentFormState> => {
    "use server";
    formData.append("paymentId", id);
    return cancelPaymentAction(prev, formData);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/payments"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Caisse
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Détail du paiement</h1>
      </div>

      <div className="space-y-4">
        {/* Recap */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{formatEuros(payment.amountCents)}</p>
              <p className="text-sm text-gray-500">{formatDate(payment.paidAt)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <PaymentMethodBadge method={payment.method} />
              <PaymentTransactionBadge status={payment.status} />
            </div>
          </div>

          <dl className="divide-y divide-gray-100 text-sm">
            {payment.clientName && (
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Client</dt>
                <dd className="font-medium text-gray-900">{payment.clientName}</dd>
              </div>
            )}
            {payment.guestName && !payment.clientName && (
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Invité</dt>
                <dd className="font-medium text-gray-900">{payment.guestName}</dd>
              </div>
            )}
            {payment.appointmentId && (
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Rendez-vous</dt>
                <dd>
                  <Link
                    href={`/dashboard/appointments/${payment.appointmentId}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {payment.appointmentLabel ?? "Voir le RDV"} →
                  </Link>
                </dd>
              </div>
            )}
            {payment.receiptNumber && (
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">N° reçu</dt>
                <dd className="text-gray-900">{payment.receiptNumber}</dd>
              </div>
            )}
            {payment.notes && (
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Notes</dt>
                <dd className="text-gray-700">{payment.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Lignes */}
        {payment.lines.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Lignes de prestation</h2>
            <div className="space-y-2">
              {payment.lines.map((line) => (
                <div key={line.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {line.label}
                    {line.quantity > 1 && (
                      <span className="ml-1 text-xs text-gray-400">× {line.quantity}</span>
                    )}
                  </span>
                  <span className="font-medium text-gray-900">{formatEuros(line.totalCents)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Annulation */}
        {payment.status === "COMPLETED" && (
          <CancelPaymentPanel action={boundCancelAction} />
        )}
      </div>
    </div>
  );
}
