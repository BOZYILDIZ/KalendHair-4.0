import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { getStockMovements } from "@/features/inventory/stock.service";
import { StockHistoryTable } from "@/features/inventory/components/stock-history-table";

type Props = {
  searchParams: Promise<{ page?: string; productId?: string }>;
};

export default async function MovementsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10));
  const productId = sp.productId;

  const result = await getStockMovements(salon.id, session.organizationId, { page, productId });
  const totalPages = Math.ceil(result.total / result.pageSize);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Historique des mouvements
          {productId && (
            <span className="ml-2 text-sm font-normal text-gray-500">— filtré par produit</span>
          )}
        </h1>
        {productId && (
          <Link
            href="/dashboard/inventory/movements"
            className="text-sm text-indigo-600 hover:underline"
          >
            Voir tous →
          </Link>
        )}
      </div>

      <p className="mb-4 text-sm text-gray-500">
        {result.total} mouvement{result.total > 1 ? "s" : ""}
      </p>

      <StockHistoryTable movements={result.movements} />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Page {result.page} / {totalPages}</span>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                href={`?page=${result.page - 1}${productId ? `&productId=${productId}` : ""}`}
                className="rounded border px-3 py-1 hover:bg-gray-50"
              >
                ← Précédent
              </Link>
            )}
            {result.page < totalPages && (
              <Link
                href={`?page=${result.page + 1}${productId ? `&productId=${productId}` : ""}`}
                className="rounded border px-3 py-1 hover:bg-gray-50"
              >
                Suivant →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <Link href="/dashboard/inventory" className="text-sm text-gray-500 hover:underline">
          ← Stocks &amp; Produits
        </Link>
      </div>
    </div>
  );
}
