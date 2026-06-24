// Codex — Sprint 18
import type { OrgSubStatus } from "../types";

const CONFIG: Record<OrgSubStatus, { label: string; className: string }> = {
  TRIAL:    { label: "Essai",      className: "bg-blue-100 text-blue-700" },
  ACTIVE:   { label: "Actif",      className: "bg-green-100 text-green-700" },
  PAST_DUE: { label: "En retard",  className: "bg-yellow-100 text-yellow-700" },
  CANCELED: { label: "Annulé",     className: "bg-red-100 text-red-700" },
};

type Props = { status: OrgSubStatus };

export function BillingStatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
