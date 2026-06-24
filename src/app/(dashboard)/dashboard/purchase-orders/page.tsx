import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import { getPurchaseOrders } from "@/features/purchase-orders/purchase-order.service";
import { PurchaseOrderList } from "@/features/purchase-orders/components/purchase-order-list";

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePurchaseOrders(session, session.organizationId)) redirect("/dashboard");

  const { page, search } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10));

  const ordersPage = await getPurchaseOrders(salon.id, session.organizationId, {
    page:   pageNum,
    search: search || undefined,
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

      <PurchaseOrderList
        orders={ordersPage.orders}
        total={ordersPage.total}
        page={ordersPage.page}
        pageSize={ordersPage.pageSize}
      />
    </main>
  );
}
