import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { getProducts } from "@/features/inventory/product.service";
import { SellProductForm } from "@/features/inventory/components/sell-product-form";
import { sellProductAction } from "./actions";
import type { ProductSummary } from "@/features/inventory/types";

export default async function SellPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const result = await getProducts(salon.id, session.organizationId, { includeInactive: false });

  const products: ProductSummary[] = result.products.map((p) => ({
    id:           p.id,
    name:         p.name,
    unit:         p.unit,
    priceCents:   p.priceCents,
    currentStock: p.currentStock,
    isActive:     p.isActive,
  }));

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Vente produit</h1>
        <p className="text-sm text-gray-500">
          La vente crée un paiement et déduit le stock automatiquement.
        </p>
      </div>

      <SellProductForm products={products} action={sellProductAction} />

      <div className="mt-4 border-t pt-4">
        <Link href="/dashboard/inventory" className="text-sm text-gray-500 hover:underline">
          ← Stocks &amp; Produits
        </Link>
      </div>
    </div>
  );
}
