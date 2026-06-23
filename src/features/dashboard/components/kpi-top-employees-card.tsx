import type { TopEmployeeRow } from "../types";

type Props = { employees: TopEmployeeRow[] };

function formatCents(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

export function KpiTopEmployeesCard({ employees }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="mb-3 text-sm font-medium text-gray-500">Top employés (période)</p>
      {employees.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune donnée sur cette période</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="pb-2 text-left font-medium">#</th>
                <th className="pb-2 text-left font-medium">Employé</th>
                <th className="pb-2 text-right font-medium">RDV</th>
                <th className="pb-2 text-right font-medium">CA</th>
                <th className="pb-2 text-right font-medium">% CA</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => (
                <tr key={e.employeeId} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-3 text-gray-400">{i + 1}</td>
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      {e.color && (
                        <span
                          className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                      )}
                      <span className="font-medium text-gray-800">
                        {e.firstName} {e.lastName}
                      </span>
                    </span>
                  </td>
                  <td className="py-2 text-right text-gray-600">{e.count}</td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {formatCents(e.revenueCents)}
                  </td>
                  <td className="py-2 text-right text-gray-500">{e.revenueSharePercent} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
