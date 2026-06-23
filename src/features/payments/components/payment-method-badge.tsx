import type { PaymentMethod } from "../types";
import { PAYMENT_METHOD_LABELS } from "../types";

type Props = { method: PaymentMethod };

const METHOD_CLASSES: Record<PaymentMethod, string> = {
  CASH:     "bg-emerald-100 text-emerald-800",
  CARD:     "bg-indigo-100 text-indigo-800",
  TRANSFER: "bg-sky-100 text-sky-800",
  OTHER:    "bg-gray-100 text-gray-600",
};

export function PaymentMethodBadge({ method }: Props) {
  const label   = PAYMENT_METHOD_LABELS[method];
  const classes = METHOD_CLASSES[method];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
