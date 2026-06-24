import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { getProduct } from "@/features/inventory/product.service";
import { getStockMovements } from "@/features/inventory/stock.service";
import { StockBadge } from "@/features/inventory/components/stock-badge";
import { StockHistoryTable } from "@/features/inventory/components/stock-history-table";
import { DeactivateProductButton } from "@/features/inventory/components/deactivate-product-button";
import { deactivateProductAction } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function ProductDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const [product, movementsPage] = await Promise.all([
    getProduct(id, salon.id, session.organizationId),
    getStockMovements(salon.id, session.organizationId, { productId: id }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
          {product.categoryName && (
            <p className="text-sm text-gray-500">{product.categoryName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/inventory/products/${id}/edit`}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Modifier
          </Link>
          <Link
            href={`/dashboard/inventory/entry?productId=${id}`}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Entrée stock
          </Link>
        </div>
      </div>

      {/* Info card */}
      <div className="mb-6 rounded-lg border bg-white p-5">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Stock actuel</dt>
            <dd className="mt-1">
              <StockBadge quantity={product.currentStock} threshold={product.lowStockThreshold} />
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Seuil alerte</dt>
            <dd className="mt-1 font-medium text-gray-900">{product.lowStockThreshold} {product.unit}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Unité</dt>
            <dd className="mt-1 font-medium text-gray-900">{product.unit}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Prix de vente</dt>
            <dd className="mt-1 font-medium text-gray-900">{formatEuros(product.priceCents)}</dd>
          </div>
          {product.costPriceCents != null && (
            <div>
              <dt className="text-gray-500">Prix de revient</dt>
              <dd className="mt-1 font-medium text-gray-900">{formatEuros(product.costPriceCents)}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Statut</dt>
            <dd className="mt-1 font-medium">
              {product.isActive ? (
                <span className="text-green-600">Actif</span>
              ) : (
                <span className="text-gray-400">Inactif</span>
              )}
            </dd>
          </div>
        </dl>
        {product.description && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
        )}
      </div>

      {/* Movements */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Historique des mouvements ({movementsPage.total})
        </h2>
        {movementsPage.total > movementsPage.pageSize && (
          <Link
            href={`/dashboard/inventory/movements?productId=${id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            Voir tout →
          </Link>
        )}
      </div>
      <StockHistoryTable movements={movementsPage.movements} />

      {product.isActive && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4">
          <h3 className="mb-1 text-sm font-semibold text-red-700">Désactiver ce produit</h3>
          <p className="mb-3 text-xs text-red-600">
            Le produit n&apos;apparaîtra plus dans la liste active ni dans le formulaire de vente.
            Le stock doit être à zéro avant de procéder.
          </p>
          <DeactivateProductButton action={deactivateProductAction.bind(null, id)} />
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <Link href="/dashboard/inventory/products" className="text-sm text-gray-500 hover:underline">
          ← Retour aux produits
        </Link>
      </div>
    </div>
  );
}
