import Link from "next/link";
import type { PaymentSummary } from "../types";
import { AppointmentPaymentStateBadge } from "./payment-status-badge";
import { PaymentMethodBadge } from "./payment-method-badge";

type Props = {
  summary:       PaymentSummary;
  appointmentId: string;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function PaymentSummaryCard({ summary, appointmentId }: Props) {
  const { state, totalPaidCents, expectedCents, remainingCents, payments } = summary;
  const completed = payments.filter((p) => p.status === "COMPLETED");
  const excessCents = totalPaidCents > expectedCents ? totalPaidCents - expectedCents : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">Paiement</p>
        <AppointmentPaymentStateBadge
          state={state}
          remainingCents={state === "partial" ? remainingCents : undefined}
          excessCents={state === "overpaid" ? excessCents : undefined}
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-500">Montant attendu</span>
        <span className="text-right font-medium text-gray-900">{formatEuros(expectedCents)}</span>
        <span className="text-gray-500">Encaissé</span>
        <span className="text-right font-medium text-gray-900">{formatEuros(totalPaidCents)}</span>
        {state === "partial" && (
          <>
            <span className="text-gray-500">Solde restant</span>
            <span className="text-right font-medium text-orange-600">{formatEuros(remainingCents)}</span>
          </>
        )}
        {state === "overpaid" && (
          <>
            <span className="text-gray-500">Excédent</span>
            <span className="text-right font-medium text-blue-600">{formatEuros(excessCents)}</span>
          </>
        )}
      </div>

      {completed.length > 0 && (
        <div className="mb-3 space-y-1">
          {completed.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5 text-xs">
              <span className="text-gray-500">{formatDate(p.paidAt)}</span>
              <PaymentMethodBadge method={p.method} />
              <span className="font-medium text-gray-800">{formatEuros(p.amountCents)}</span>
            </div>
          ))}
        </div>
      )}

      {state !== "paid" && (
        <Link
          href={`/dashboard/appointments/${appointmentId}/pay`}
          className="mt-1 inline-flex w-full items-center justify-center rounded border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
        >
          {state === "unpaid" ? "Encaisser" : state === "partial" ? "Encaisser le solde" : "Ajouter un paiement"} →
        </Link>
      )}
    </div>
  );
}
