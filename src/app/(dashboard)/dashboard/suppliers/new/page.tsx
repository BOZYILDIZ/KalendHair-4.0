import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageSuppliers } from "@/lib/permissions/supplier.permissions";
import { SupplierForm } from "@/features/suppliers/components/supplier-form";
import { createSupplierAction } from "./actions";

export default async function NewSupplierPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageSuppliers(session, session.organizationId)) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <Link href="/dashboard/suppliers" className="text-sm text-blue-600 hover:underline">
          ← Fournisseurs
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Nouveau fournisseur</h1>
      </div>

      <SupplierForm action={createSupplierAction} submitLabel="Créer le fournisseur" />
    </main>
  );
}
