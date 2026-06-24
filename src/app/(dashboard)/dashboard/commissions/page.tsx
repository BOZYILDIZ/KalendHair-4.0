import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canViewCommissions } from "@/lib/permissions/commission.permissions";
import { getCommissionOverview } from "@/features/commissions/commission-entry.service";

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function CommissionsOverviewPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canViewCommissions(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const sp      = await searchParams;
  const from    = sp.from ?? undefined;
  const to      = sp.to   ?? undefined;

  const overview = await getCommissionOverview(salon.id, session.organizationId, { from, to });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Commissions</h1>
          <p className="text-sm text-gray-500">{salon.name}</p>
        </div>
        <Link
          href="/dashboard/commissions/rules"
          className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Gérer les règles
        </Link>
      </div>

      {/* Filtres dates */}
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
          <Link href="/dashboard/commissions" className="text-sm text-indigo-600 hover:underline">
            Réinitialiser
          </Link>
        )}
      </form>

      {/* Totaux */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Base totale</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatEuros(overview.totalBaseCents)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Net total</p>
          <p className="mt-1 text-2xl font-bold text-indigo-700">{formatEuros(overview.totalNetCents)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Entrées</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{overview.entryCount}</p>
          <p className="text-xs text-gray-400">Hors annulées</p>
        </div>
      </div>

      {/* Par employé */}
      {overview.byEmployee.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
          Aucune commission sur la période sélectionnée.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Employé</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Base</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Net</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Entrées</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overview.byEmployee.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.employeeName}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">{formatEuros(emp.baseCents)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-indigo-700">{formatEuros(emp.netCents)}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">{emp.count}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/employees/${emp.employeeId}/commissions`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Détail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
