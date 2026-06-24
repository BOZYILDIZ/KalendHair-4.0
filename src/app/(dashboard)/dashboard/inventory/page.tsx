import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { getInventoryDashboard } from "@/features/inventory/stock.service";
import { InventoryStatsCard } from "@/features/inventory/components/inventory-stats-card";
import { LowStockAlert } from "@/features/inventory/components/low-stock-alert";
import { StockHistoryTable } from "@/features/inventory/components/stock-history-table";

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function InventoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const dashboard = await getInventoryDashboard(salon.id, session.organizationId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Stocks &amp; Produits</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/inventory/products/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Produit
          </Link>
          <Link
            href="/dashboard/inventory/entry"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Entrée stock
          </Link>
          <Link
            href="/dashboard/inventory/sell"
            className="rounded-md border border-green-600 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            Vendre
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InventoryStatsCard label="Produits totaux"  value={dashboard.totalProducts} />
        <InventoryStatsCard label="Produits actifs"  value={dashboard.activeProducts} />
        <InventoryStatsCard label="Valeur stock"     value={formatEuros(dashboard.totalStockValue)} />
        <InventoryStatsCard
          label="Alertes stock"
          value={dashboard.lowStockCount}
          sub={dashboard.lowStockCount > 0 ? "à réapprovisionner" : "tout est OK"}
        />
      </div>

      {dashboard.lowStockProducts.length > 0 && (
        <div className="mb-6">
          <LowStockAlert products={dashboard.lowStockProducts} />
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Derniers mouvements</h2>
        <Link href="/dashboard/inventory/movements" className="text-sm text-indigo-600 hover:underline">
          Voir tout →
        </Link>
      </div>
      <StockHistoryTable movements={dashboard.recentMovements} />

      <div className="mt-6 flex flex-wrap gap-3 border-t pt-4 text-sm">
        <Link href="/dashboard/inventory/products" className="text-indigo-600 hover:underline">
          Liste des produits →
        </Link>
        <Link href="/dashboard/inventory/categories" className="text-indigo-600 hover:underline">
          Catégories →
        </Link>
        <Link href="/dashboard/inventory/movements" className="text-indigo-600 hover:underline">
          Historique complet →
        </Link>
        <Link href="/dashboard" className="text-gray-500 hover:underline">
          ← Tableau de bord
        </Link>
      </div>
    </div>
  );
}
