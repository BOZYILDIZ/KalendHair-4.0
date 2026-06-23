import type { AppointmentCounts } from "../types";

type Props = { counts: AppointmentCounts };

function pct(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

export function KpiAppointmentsCard({ counts }: Props) {
  const { total, completed, confirmed, pending, cancelled, noShow } = counts;
  const inProgress = confirmed + pending;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">Rendez-vous</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{total}</p>

      {total > 0 && (
        <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="bg-green-500"  style={{ width: `${pct(completed,  total)}%` }} />
          <div className="bg-blue-400"   style={{ width: `${pct(inProgress, total)}%` }} />
          <div className="bg-red-400"    style={{ width: `${pct(cancelled,  total)}%` }} />
          <div className="bg-orange-400" style={{ width: `${pct(noShow,     total)}%` }} />
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          Terminés : {completed}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
          En cours : {inProgress}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
          Annulés : {cancelled}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
          No-shows : {noShow}
        </span>
      </div>

      {total > 0 && (
        <p className="mt-2 text-xs text-gray-400">
          Annulation {pct(cancelled, total)} % · No-show {pct(noShow, total)} %
        </p>
      )}
    </div>
  );
}
