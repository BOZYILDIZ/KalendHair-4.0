import type { PurchaseOrderStatus } from "@prisma/client";

const STATUS_CONFIG: Record<PurchaseOrderStatus, { label: string; className: string }> = {
  DRAFT:              { label: "Brouillon",     className: "bg-gray-100 text-gray-700" },
  SENT:               { label: "Envoyé",        className: "bg-blue-100 text-blue-700" },
  PARTIALLY_RECEIVED: { label: "Partiel",       className: "bg-yellow-100 text-yellow-800" },
  RECEIVED:           { label: "Réceptionné",   className: "bg-green-100 text-green-700" },
  CANCELLED:          { label: "Annulé",        className: "bg-red-100 text-red-700" },
};

type Props = { status: PurchaseOrderStatus };

export function PurchaseOrderStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
