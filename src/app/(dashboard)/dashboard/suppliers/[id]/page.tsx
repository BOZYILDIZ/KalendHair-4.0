import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageSuppliers } from "@/lib/permissions/supplier.permissions";
import { getSupplier } from "@/features/suppliers/supplier.service";
import { SupplierDetail } from "@/features/suppliers/components/supplier-detail";
import { deactivateSupplierAction } from "./actions";

export default async function SupplierPage({
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

  const boundDeactivate = deactivateSupplierAction.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <Link href="/dashboard/suppliers" className="text-sm text-blue-600 hover:underline">
          ← Fournisseurs
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{supplier.name}</h1>
      </div>

      <SupplierDetail supplier={supplier} deactivateAction={boundDeactivate} />
    </main>
  );
}
