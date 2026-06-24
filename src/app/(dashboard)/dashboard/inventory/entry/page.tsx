import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { getProduct } from "@/features/inventory/product.service";
import { StockMovementForm } from "@/features/inventory/components/stock-movement-form";
import { recordEntryAction } from "./actions";

type Props = {
  searchParams: Promise<{ productId?: string }>;
};

export default async function EntryPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  if (!sp.productId) redirect("/dashboard/inventory/products");

  const product = await getProduct(sp.productId, salon.id, session.organizationId);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Entrée stock</h1>
      </div>

      <StockMovementForm
        productId={product.id}
        productName={product.name}
        currentStock={product.currentStock}
        action={recordEntryAction}
        mode="entry"
      />

      <div className="mt-4 border-t pt-4">
        <Link
          href={`/dashboard/inventory/products/${product.id}`}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Retour au produit
        </Link>
      </div>
    </div>
  );
}
