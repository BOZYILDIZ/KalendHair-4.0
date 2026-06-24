import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageInventory } from "@/lib/permissions/inventory.permissions";
import { getProduct, getProductCategories } from "@/features/inventory/product.service";
import { ProductForm } from "@/features/inventory/components/product-form";
import { updateProductAction } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageInventory(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id, salon.id, session.organizationId),
    getProductCategories(salon.id, session.organizationId),
  ]);

  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, id);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Modifier le produit</h1>
        <p className="text-sm text-gray-500">{product.name}</p>
      </div>

      <ProductForm
        categories={categories}
        product={product}
        action={boundAction}
        submitLabel="Enregistrer les modifications"
      />

      <div className="mt-4 border-t pt-4">
        <Link href={`/dashboard/inventory/products/${id}`} className="text-sm text-gray-500 hover:underline">
          ← Retour au produit
        </Link>
      </div>
    </div>
  );
}
