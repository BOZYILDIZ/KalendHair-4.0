import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { getProductCategories } from "@/features/inventory/product.service";
import { ProductForm } from "@/features/inventory/components/product-form";
import { createProductAction } from "./actions";

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const categories = await getProductCategories(salon.id, session.organizationId);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nouveau produit</h1>
      </div>

      <ProductForm
        categories={categories}
        action={createProductAction}
        submitLabel="Créer le produit"
      />

      <div className="mt-4 border-t pt-4">
        <Link href="/dashboard/inventory/products" className="text-sm text-gray-500 hover:underline">
          ← Retour aux produits
        </Link>
      </div>
    </div>
  );
}
