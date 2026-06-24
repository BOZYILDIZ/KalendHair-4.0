import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { getProducts } from "@/features/inventory/product.service";
import { ProductList } from "@/features/inventory/components/product-list";

type Props = {
  searchParams: Promise<{ page?: string; all?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const page           = Math.max(1, parseInt(sp.page ?? "1", 10));
  const includeInactive = sp.all === "1";

  const result = await getProducts(salon.id, session.organizationId, {
    page,
    includeInactive,
  });

  const totalPages = Math.ceil(result.total / result.pageSize);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Produits</h1>
        <Link
          href="/dashboard/inventory/products/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nouveau produit
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-gray-500">{result.total} produit{result.total > 1 ? "s" : ""}</span>
        <Link
          href={includeInactive ? "/dashboard/inventory/products" : "?all=1"}
          className="text-indigo-600 hover:underline"
        >
          {includeInactive ? "Masquer les inactifs" : "Afficher tous"}
        </Link>
      </div>

      <ProductList products={result.products} />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Page {result.page} / {totalPages}</span>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                href={`?page=${result.page - 1}${includeInactive ? "&all=1" : ""}`}
                className="rounded border px-3 py-1 hover:bg-gray-50"
              >
                ← Précédent
              </Link>
            )}
            {result.page < totalPages && (
              <Link
                href={`?page=${result.page + 1}${includeInactive ? "&all=1" : ""}`}
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
