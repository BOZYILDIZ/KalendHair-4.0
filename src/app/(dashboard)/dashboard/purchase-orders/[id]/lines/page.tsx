import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import { getPurchaseOrder } from "@/features/purchase-orders/purchase-order.service";
import { getProductSummaries } from "@/features/inventory/product.service";
import { PurchaseOrderLinesForm } from "@/features/purchase-orders/components/purchase-order-lines-form";
import { addOrderLineAction, removeOrderLineAction } from "./actions";
export default async function PurchaseOrderLinesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePurchaseOrders(session, session.organizationId)) redirect("/dashboard");

  const { id } = await params;
  const order = await getPurchaseOrder(id, salon.id, session.organizationId);
  if (!order) notFound();

  if (order.status !== "DRAFT") {
    redirect(`/dashboard/purchase-orders/${id}`);
  }

  const products = await getProductSummaries(salon.id, session.organizationId);

  const boundAddLine = addOrderLineAction.bind(null, id);

  const lineRemoveActions: Record<string, (fd: FormData) => Promise<void>> = {};
  for (const line of order.lines) {
    // bind pre-fills (lineId, orderId, prev=null) — remaining arg is formData only
    lineRemoveActions[line.id] = removeOrderLineAction.bind(
      null, line.id, id, null,
    ) as unknown as (fd: FormData) => Promise<void>;
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/purchase-orders/${id}`} className="text-sm text-blue-600 hover:underline">
            ← Retour au bon de commande
          </Link>
          <h1 className="mt-2 text-xl font-semibold">
            Lignes — {order.reference ?? `#${id.slice(-6).toUpperCase()}`}
          </h1>
          <p className="text-sm text-gray-500">Fournisseur : {order.supplierName}</p>
        </div>
        <Link
          href={`/dashboard/purchase-orders/${id}`}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Terminer
        </Link>
      </div>

      <PurchaseOrderLinesForm
        products={products}
        addLineAction={boundAddLine}
        removeLineActions={lineRemoveActions}
        lines={order.lines}
      />
    </main>
  );
}
