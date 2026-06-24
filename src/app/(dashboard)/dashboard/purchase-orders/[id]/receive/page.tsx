import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import { getPurchaseOrder } from "@/features/purchase-orders/purchase-order.service";
import { PurchaseOrderReceiveForm } from "@/features/purchase-orders/components/purchase-order-receive-form";
import { receiveStockAction } from "./actions";

export default async function ReceivePurchaseOrderPage({
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

  if (order.status !== "SENT" && order.status !== "PARTIALLY_RECEIVED") {
    redirect(`/dashboard/purchase-orders/${id}`);
  }

  const receivableLines = order.lines
    .filter((l) => l.quantityRemaining > 0)
    .map((l) => ({
      purchaseOrderLineId: l.id,
      productId:           l.productId,
      productName:         l.productName,
      productUnit:         l.productUnit,
      quantityOrdered:     l.quantityOrdered,
      quantityReceived:    l.quantityReceived,
      quantityRemaining:   l.quantityRemaining,
      unitCostCents:       l.unitCostCents,
    }));

  const boundReceive = receiveStockAction.bind(null, id);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <Link href={`/dashboard/purchase-orders/${id}`} className="text-sm text-blue-600 hover:underline">
          ← Retour au bon de commande
        </Link>
        <h1 className="mt-2 text-xl font-semibold">
          Réceptionner — {order.reference ?? `#${id.slice(-6).toUpperCase()}`}
        </h1>
        <p className="text-sm text-gray-500">Fournisseur : {order.supplierName}</p>
      </div>

      <PurchaseOrderReceiveForm
        receivableLines={receivableLines}
        receiveAction={boundReceive}
      />
    </main>
  );
}
