import { AgendaClosedDayBanner } from "./agenda-closed-day-banner";
import { AgendaTimeRuler } from "./agenda-time-ruler";
import { AgendaEmployeeColumn } from "./agenda-employee-column";
import { AgendaNowIndicator } from "./agenda-now-indicator";
import type { AgendaDayData } from "../types";

type Props = {
  data: AgendaDayData;
};

export function AgendaDayView({ data }: Props) {
  const { isClosed, closedReason, salonIsOpen, columns, gridConfig } = data;

  if (isClosed) {
    return <AgendaClosedDayBanner reason={closedReason} type="closed-day" />;
  }

  if (!salonIsOpen) {
    return <AgendaClosedDayBanner reason={null} type="salon-closed" />;
  }

  if (columns.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
        Aucun employé actif dans ce salon.
      </p>
    );
  }

  const isToday = data.date === data.todayStr;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      {/* Employee header row */}
      <div className="flex border-b border-gray-200">
        <div className="flex-none border-r border-gray-200 bg-gray-50" style={{ width: "4rem" }} />
        {columns.map((col) => (
          <div
            key={col.employee.id}
            className="flex flex-1 items-center gap-1.5 border-l border-gray-200 bg-gray-50 px-2 py-2 text-sm font-medium text-gray-700 first:border-l-0"
            style={{ minWidth: "8rem" }}
          >
            <span
              className="inline-block h-2.5 w-2.5 flex-none rounded-full"
              style={{ backgroundColor: col.employee.color ?? "#6366f1" }}
            />
            <span className="truncate">
              {col.employee.firstName} {col.employee.lastName}
            </span>
            {!col.isWorking && (
              <span className="ml-auto text-xs text-gray-400">Repos</span>
            )}
          </div>
        ))}
      </div>

      {/* Grid body */}
      <div className="flex">
        {/* Time ruler */}
        <div className="flex-none border-r border-gray-200 bg-gray-50" style={{ width: "4rem" }}>
          <AgendaTimeRuler gridConfig={gridConfig} />
        </div>

        {/* Columns container (relative for now-indicator) */}
        <div className="relative flex flex-1">
          {isToday && (
            <AgendaNowIndicator
              timezone={data.timezone}
              gridConfig={gridConfig}
              initialNowMinute={data.nowMinute}
            />
          )}
          {columns.map((col) => (
            <AgendaEmployeeColumn
              key={col.employee.id}
              column={col}
              gridConfig={gridConfig}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 border-t border-gray-100 px-4 py-2">
        {[
          { label: "En attente", color: "bg-yellow-200" },
          { label: "Confirmé", color: "bg-green-200" },
          { label: "Terminé", color: "bg-blue-200" },
          { label: "Annulé", color: "bg-gray-200" },
          { label: "Absent", color: "bg-red-200" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1 text-xs text-gray-500">
            <span className={`inline-block h-2 w-2 rounded-sm ${color}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
