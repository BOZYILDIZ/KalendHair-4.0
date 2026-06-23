import type { FillRateResult } from "../types";

type Props = { fillRate: FillRateResult };

function fmtMin(minutes: number): string {
  const h   = Math.floor(minutes / 60);
  const min = minutes % 60;
  if (h > 0 && min > 0) return `${h}h${String(min).padStart(2, "0")}`;
  if (h > 0)            return `${h}h`;
  return `${min}min`;
}

export function KpiFillRateCard({ fillRate }: Props) {
  const { ratePercent, bookedMinutes, availableMinutes } = fillRate;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">Taux de remplissage</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {ratePercent === null ? "—" : `${ratePercent} %`}
      </p>

      {availableMinutes > 0 && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${ratePercent ?? 0}%` }}
          />
        </div>
      )}

      <p className="mt-2 text-xs text-gray-400">
        {availableMinutes === 0
          ? "Aucune disponibilité calculée"
          : `${fmtMin(bookedMinutes)} réservés · ${fmtMin(availableMinutes)} disponibles`}
      </p>
    </div>
  );
}
