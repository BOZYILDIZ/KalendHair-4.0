import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePayment } from "@/lib/permissions/payment.permissions";
import { getPayment } from "@/features/payments/payment.service";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/types";
import { ReceiptPrintButton } from "@/features/payments/components/receipt-print-button";

type Props = {
  params: Promise<{ id: string }>;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

export default async function ReceiptPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePayment(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const payment = await getPayment(salon.id, session.organizationId, id);
  if (!payment || !payment.receiptNumber) notFound();

  const isCancelled = payment.status === "CANCELLED";
  const salonAddress = [salon.address, salon.postalCode, salon.city]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {/* CSS impression — @page sans marges, corps blanc */}
      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
        {/* Barre d'actions — masquée à l'impression */}
        <div className="print:hidden mx-auto mb-6 max-w-2xl px-4 flex items-center justify-between">
          <Link
            href={`/dashboard/payments/${id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Retour au paiement
          </Link>
          <ReceiptPrintButton />
        </div>

        {/* Corps du reçu */}
        <div className="mx-auto max-w-2xl px-4 print:px-0">
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">

            {/* Bandeau ANNULÉ — visible écran ET impression (RECOMMANDÉ 4) */}
            {isCancelled && (
              <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-5 py-3 text-center text-sm font-semibold text-red-700">
                CE PAIEMENT A ÉTÉ ANNULÉ — Ce reçu est conservé à titre d&apos;archive uniquement.
              </div>
            )}

            {/* En-tête : salon */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{salon.name}</h1>
                {salonAddress && (
                  <p className="mt-1 text-sm text-gray-500">{salonAddress}</p>
                )}
                {salon.phone && (
                  <p className="text-sm text-gray-500">{salon.phone}</p>
                )}
                {salon.email && (
                  <p className="text-sm text-gray-500">{salon.email}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Reçu
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {payment.receiptNumber}
                </p>
              </div>
            </div>

            {/* Séparateur */}
            <hr className="mb-6 border-gray-200" />

            {/* Infos paiement */}
            <dl className="mb-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Date
                </dt>
                <dd className="mt-1 text-gray-900">
                  {formatDate(payment.paidAt, salon.timezone)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Mode de paiement
                </dt>
                <dd className="mt-1 text-gray-900">
                  {PAYMENT_METHOD_LABELS[payment.method]}
                </dd>
              </div>
              {payment.clientName && (
                <div className="col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Client
                  </dt>
                  <dd className="mt-1 text-gray-900">{payment.clientName}</dd>
                </div>
              )}
            </dl>

            {/* Lignes de prestation */}
            <div className="mb-6 overflow-hidden rounded-md border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Prestation
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Qté
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      P.U.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payment.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3 text-gray-900">{line.label}</td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {line.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {formatEuros(line.unitPriceCents)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatEuros(line.totalCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-48 rounded-md bg-gray-900 px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Total
                </p>
                <p className="text-xl font-bold text-white">
                  {formatEuros(payment.amountCents)}
                </p>
              </div>
            </div>

            {/* Notes */}
            {payment.notes && (
              <div className="mt-6 text-sm text-gray-500">
                <span className="font-medium text-gray-700">Notes :</span>{" "}
                {payment.notes}
              </div>
            )}

            {/* Pied de page légal */}
            <div className="mt-8 border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
              Document généré par KalendHair — à conserver pour vos archives.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
