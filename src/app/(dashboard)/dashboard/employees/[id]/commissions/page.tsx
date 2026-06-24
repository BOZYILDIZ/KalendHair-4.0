import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canViewCommissions } from "@/lib/permissions/commission.permissions";
import { getEmployee } from "@/features/employees/employee.service";
import {
  getEmployeeCommissions,
  getEmployeeCommissionSummary,
} from "@/features/commissions/commission-entry.service";
import { CommissionSummaryCard } from "@/features/commissions/components/commission-summary-card";
import { CommissionEntryTable } from "@/features/commissions/components/commission-entry-table";
import { CommissionAdjustForm } from "@/features/commissions/components/commission-adjust-form";
import { adjustCommissionAction } from "@/app/(dashboard)/dashboard/commissions/actions";

type Props = {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
};

export default async function EmployeeCommissionsPage({ params, searchParams }: Props) {
  const { id }  = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canViewCommissions(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const employee = await getEmployee(id, session.organizationId);
  if (!employee || employee.salonId !== salon.id) notFound();

  const sp   = await searchParams;
  const from = sp.from   ?? undefined;
  const to   = sp.to     ?? undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const [summary, entriesPage] = await Promise.all([
    getEmployeeCommissionSummary(id, salon.id, session.organizationId, { from, to }),
    getEmployeeCommissions(id, salon.id, session.organizationId, { page, from, to }),
  ]);

  const totalPages = Math.ceil(entriesPage.total / entriesPage.pageSize);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/dashboard/employees/${id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Fiche employé
          </Link>
          <h1 className="mt-1 text-xl font-bold text-gray-900">
            Commissions — {employee.firstName} {employee.lastName}
          </h1>
        </div>
      </div>

      {/* Filtres */}
      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Depuis</label>
          <input
            name="from"
            type="date"
            defaultValue={from}
            className="mt-1 rounded border px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">{"Jusqu'au"}</label>
          <input
            name="to"
            type="date"
            defaultValue={to}
            className="mt-1 rounded border px-2 py-1 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Filtrer
        </button>
        {(from ?? to) && (
          <Link
            href={`/dashboard/employees/${id}/commissions`}
            className="text-sm text-indigo-600 hover:underline"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="mb-6">
        <CommissionSummaryCard summary={summary} />
      </div>

      <div className="mb-6">
        <CommissionEntryTable entries={entriesPage.entries} showEmployee={false} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mb-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`?from=${from ?? ""}&to=${to ?? ""}&page=${page - 1}`}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            >
              ← Précédent
            </Link>
          )}
          <span className="px-3 py-1 text-sm text-gray-500">
            Page {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`?from=${from ?? ""}&to=${to ?? ""}&page=${page + 1}`}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Suivant →
            </Link>
          )}
        </div>
      )}

      {/* Ajustement (owner uniquement → permission dans l'action) */}
      {entriesPage.entries.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Ajouter un ajustement</h2>
          <p className="mb-3 text-xs text-gray-400">
            {"Sélectionnez l'identifiant d'une entrée dans le tableau ci-dessus pour y appliquer un ajustement."}
          </p>
          <CommissionAdjustForm
            entryId={entriesPage.entries[0]?.id ?? ""}
            action={adjustCommissionAction}
          />
        </div>
      )}
    </div>
  );
}
