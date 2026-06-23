import type { AppointmentPaymentState, PaymentStatus } from "../types";

type AppointmentBadgeProps = { state: AppointmentPaymentState; remainingCents?: number; excessCents?: number };
type TransactionBadgeProps = { status: PaymentStatus };

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function AppointmentPaymentStateBadge({ state, remainingCents, excessCents }: AppointmentBadgeProps) {
  if (state === "paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        Soldé
      </span>
    );
  }
  if (state === "partial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
        Partiel{remainingCents !== undefined ? ` — ${formatEuros(remainingCents)} restant` : ""}
      </span>
    );
  }
  if (state === "overpaid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
        Surpayé{excessCents !== undefined ? ` de ${formatEuros(excessCents)}` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      Non encaissé
    </span>
  );
}

export function PaymentTransactionBadge({ status }: TransactionBadgeProps) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        Soldé
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
      Annulé
    </span>
  );
}
