import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePurchaseOrders } from "@/lib/permissions/purchase-order.permissions";
import { getSupplierSummaries } from "@/features/suppliers/supplier.service";
import { PurchaseOrderForm } from "@/features/purchase-orders/components/purchase-order-form";
import { createPurchaseOrderAction } from "./actions";

export default async function NewPurchaseOrderPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePurchaseOrders(session, session.organizationId)) redirect("/dashboard");

  const suppliers = await getSupplierSummaries(salon.id, session.organizationId);

  if (suppliers.length === 0) {
    return (
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div>
          <Link href="/dashboard/purchase-orders" className="text-sm text-blue-600 hover:underline">
            ← Bons de commande
          </Link>
          <h1 className="mt-2 text-xl font-semibold">Nouveau bon de commande</h1>
        </div>
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Aucun fournisseur actif.{" "}
          <Link href="/dashboard/suppliers/new" className="font-medium underline">
            Créez un fournisseur
          </Link>{" "}
          avant de créer un bon de commande.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <Link href="/dashboard/purchase-orders" className="text-sm text-blue-600 hover:underline">
          ← Bons de commande
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Nouveau bon de commande</h1>
      </div>

      <PurchaseOrderForm suppliers={suppliers} action={createPurchaseOrderAction} />
    </main>
  );
}
