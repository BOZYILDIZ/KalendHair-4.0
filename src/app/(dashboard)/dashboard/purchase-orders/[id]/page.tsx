import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import { getPurchaseOrder } from "@/features/purchase-orders/purchase-order.service";
import { PurchaseOrderDetail } from "@/features/purchase-orders/components/purchase-order-detail";
import { sendOrderAction, cancelOrderAction } from "./actions";

export default async function PurchaseOrderPage({
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

  const boundSend   = sendOrderAction.bind(null, id);
  const boundCancel = cancelOrderAction.bind(null, id);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <Link href="/dashboard/purchase-orders" className="text-sm text-blue-600 hover:underline">
          ← Bons de commande
        </Link>
        <h1 className="mt-2 text-xl font-semibold">
          Bon de commande {order.reference ?? `#${order.id.slice(-6).toUpperCase()}`}
        </h1>
      </div>

      <PurchaseOrderDetail
        order={order}
        sendAction={boundSend}
        cancelAction={boundCancel}
      />
    </main>
  );
}
