import Link from "next/link";
import { redirect } from "next/navigation";
import type { PurchaseOrderStatus } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import { getPurchaseOrders } from "@/features/purchase-orders/purchase-order.service";
import { PurchaseOrderList } from "@/features/purchase-orders/components/purchase-order-list";

const VALID_STATUSES: PurchaseOrderStatus[] = [
  "DRAFT",
  "SENT",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
];

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT:              "Brouillon",
  SENT:               "Envoyé",
  PARTIALLY_RECEIVED: "Partiellement reçu",
  RECEIVED:           "Reçu",
  CANCELLED:          "Annulé",
};

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePurchaseOrders(session, session.organizationId)) redirect("/dashboard");

  const { page, search, status } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10));
  const statusFilter = VALID_STATUSES.includes(status as PurchaseOrderStatus)
    ? (status as PurchaseOrderStatus)
    : undefined;

  const ordersPage = await getPurchaseOrders(salon.id, session.organizationId, {
    page:   pageNum,
    search: search || undefined,
    status: statusFilter,
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bons de commande</h1>
          <p className="text-sm text-gray-500">{ordersPage.total} commande{ordersPage.total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/purchase-orders/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nouveau bon de commande
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        {search && <input type="hidden" name="search" value={search} />}
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          {VALID_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Filtrer
        </button>
        {statusFilter && (
          <Link
            href={`/dashboard/purchase-orders${search ? `?search=${encodeURIComponent(search)}` : ""}`}
            className="text-sm text-gray-500 hover:underline"
          >
            Effacer le filtre
          </Link>
        )}
      </form>

      <PurchaseOrderList
        orders={ordersPage.orders}
        total={ordersPage.total}
        page={ordersPage.page}
        pageSize={ordersPage.pageSize}
      />
    </main>
  );
}
