type Props = { newClients: number; recurringClients: number };

export function KpiClientsCard({ newClients, recurringClients }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">Clients</p>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">{newClients}</p>
          <p className="mt-0.5 text-xs text-gray-400">Nouveaux (période)</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-indigo-600">{recurringClients}</p>
          <p className="mt-0.5 text-xs text-gray-400">Récurrents (12 mois)</p>
        </div>
      </div>
    </div>
  );
}
