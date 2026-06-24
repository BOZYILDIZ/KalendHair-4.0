import type { CommissionEntryStatus } from "@/features/commissions/types";

const BADGE_STYLES: Record<CommissionEntryStatus, string> = {
  PENDING:   "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
  ADJUSTED:  "bg-orange-100 text-orange-800",
};

const BADGE_LABELS: Record<CommissionEntryStatus, string> = {
  PENDING:   "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  ADJUSTED:  "Ajustée",
};

export function CommissionStatusBadge({
  status,
}: {
  status: CommissionEntryStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[status]}`}
    >
      {BADGE_LABELS[status]}
    </span>
  );
}
