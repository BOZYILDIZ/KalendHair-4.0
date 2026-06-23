import type { TopServiceRow } from "../types";

type Props = { services: TopServiceRow[] };

function formatCents(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

export function KpiTopServicesCard({ services }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="mb-3 text-sm font-medium text-gray-500">Top services (période)</p>
      {services.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune donnée sur cette période</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="pb-2 text-left font-medium">#</th>
                <th className="pb-2 text-left font-medium">Service</th>
                <th className="pb-2 text-right font-medium">RDV</th>
                <th className="pb-2 text-right font-medium">CA</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={s.serviceId} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-3 text-gray-400">{i + 1}</td>
                  <td className="py-2 font-medium text-gray-800">{s.serviceName}</td>
                  <td className="py-2 text-right text-gray-600">{s.count}</td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {formatCents(s.revenueCents)}
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
