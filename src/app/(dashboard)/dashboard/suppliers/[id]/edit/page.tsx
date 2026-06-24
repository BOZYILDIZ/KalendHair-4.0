import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageSuppliers } from "@/lib/permissions/supplier.permissions";
import { getSupplier } from "@/features/suppliers/supplier.service";
import { SupplierForm } from "@/features/suppliers/components/supplier-form";
import { updateSupplierAction } from "../actions";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageSuppliers(session, session.organizationId)) redirect("/dashboard");

  const { id } = await params;
  const supplier = await getSupplier(id, salon.id, session.organizationId);
  if (!supplier) notFound();

  const boundUpdate = updateSupplierAction.bind(null, id);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <Link href={`/dashboard/suppliers/${id}`} className="text-sm text-blue-600 hover:underline">
          ← {supplier.name}
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Modifier le fournisseur</h1>
      </div>

      <SupplierForm
        action={boundUpdate}
        defaultValues={{
          name:        supplier.name,
          contactName: supplier.contactName ?? undefined,
          email:       supplier.email ?? undefined,
          phone:       supplier.phone ?? undefined,
          address:     supplier.address ?? undefined,
          notes:       supplier.notes ?? undefined,
        }}
        submitLabel="Enregistrer les modifications"
      />
    </main>
  );
}
