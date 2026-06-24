import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { getProductCategories } from "@/features/inventory/product.service";

export default async function CategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const categories = await getProductCategories(salon.id, session.organizationId);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Catégories de produits</h1>
        <Link
          href="/dashboard/inventory/categories/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nouvelle catégorie
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">
          Aucune catégorie. Créez-en une pour organiser vos produits.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {categories.map((c) => (
            <li key={c.id} className="px-4 py-3 text-sm text-gray-800">
              {c.name}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t pt-4">
        <Link href="/dashboard/inventory" className="text-sm text-gray-500 hover:underline">
          ← Stocks &amp; Produits
        </Link>
      </div>
    </div>
  );
}
