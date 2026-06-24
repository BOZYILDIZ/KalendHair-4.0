import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageSuppliers } from "@/lib/permissions/supplier.permissions";
import { canUseSuppliers } from "@/lib/permissions/billing.permissions";
import { getSuppliers } from "@/features/suppliers/supplier.service";
import { SupplierList } from "@/features/suppliers/components/supplier-list";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [salon, billingOk] = await Promise.all([
    getSalon(session.organizationId),
    canUseSuppliers(session.organizationId),
  ]);
  if (!salon || !canManageSuppliers(session, session.organizationId)) redirect("/dashboard");
  if (!billingOk) redirect("/dashboard/billing");

  const { page, search } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10));

  const suppliersPage = await getSuppliers(salon.id, session.organizationId, {
    page:   pageNum,
    search: search || undefined,
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Fournisseurs</h1>
          <p className="text-sm text-gray-500">{suppliersPage.total} fournisseur{suppliersPage.total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/suppliers/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nouveau fournisseur
        </Link>
      </div>

      <SupplierList
        suppliers={suppliersPage.suppliers}
        total={suppliersPage.total}
        page={suppliersPage.page}
        pageSize={suppliersPage.pageSize}
      />
    </main>
  );
}
