import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { CategoryForm } from "@/features/inventory/components/category-form";
import { createProductCategoryAction } from "./actions";

export default async function NewCategoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nouvelle catégorie</h1>
        <p className="text-sm text-gray-500">
          Les catégories permettent d&apos;organiser vos produits.
        </p>
      </div>

      <CategoryForm action={createProductCategoryAction} />

      <div className="mt-4 border-t pt-4">
        <Link
          href="/dashboard/inventory/categories"
          className="text-sm text-gray-500 hover:underline"
        >
          ← Retour aux catégories
        </Link>
      </div>
    </div>
  );
}
