import Link from "next/link";
import { AgendaTimeRuler } from "./agenda-time-ruler";
import { AgendaAppointmentBlock } from "./agenda-appointment-block";
import type { AgendaBlock, AgendaWeekData } from "../types";

type PositionedBlock = AgendaBlock & { leftPct: number; widthPct: number };

function computeLayout(blocks: AgendaBlock[]): PositionedBlock[] {
  const active = blocks.filter(
    (b) => b.status !== "CANCELLED" && b.status !== "NO_SHOW",
  );
  const inactive = blocks.filter(
    (b) => b.status === "CANCELLED" || b.status === "NO_SHOW",
  );

  const sorted = [...active].sort((a, b) => a.startMinute - b.startMinute);
  const groups: AgendaBlock[][] = [];

  for (const block of sorted) {
    let placed = false;
    for (const group of groups) {
      const overlaps = group.some(
        (g) => block.startMinute < g.endMinute && block.endMinute > g.startMinute,
      );
      if (overlaps) {
        group.push(block);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([block]);
  }

  const result: PositionedBlock[] = [];
  for (const group of groups) {
    const n = group.length;
    group.forEach((block, i) => {
      result.push({ ...block, leftPct: (i / n) * 100, widthPct: (1 / n) * 100 });
    });
  }

  for (const block of inactive) {
    result.push({ ...block, leftPct: 0, widthPct: 100 });
  }

  return result;
}


type Props = {
  data: AgendaWeekData;
  employeeId?: string;
};

export function AgendaWeekView({ data, employeeId }: Props) {
  const { days, gridConfig, todayStr } = data;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <div className="flex">
        {/* Time ruler header placeholder */}
        <div
          className="flex-none border-b border-r border-gray-200 bg-gray-50"
          style={{ width: "4rem" }}
        />
        {/* Day headers rendered inside WeekDayColumn */}
        <div className="flex flex-1">
          {days.map((day) => (
            <div key={day.date} className="flex-1 border-l border-gray-200 first:border-l-0" style={{ minWidth: "7rem" }}>
              <Link
                href={`/dashboard/agenda?view=day&date=${day.date}${employeeId ? `&employeeId=${employeeId}` : ""}`}
                className={`block border-b border-gray-200 px-2 py-2 text-center text-xs font-medium capitalize hover:bg-indigo-50 ${
                  day.date === todayStr
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                {day.label}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Grid body */}
      <div className="flex">
        {/* Time ruler */}
        <div className="flex-none border-r border-gray-200 bg-gray-50" style={{ width: "4rem" }}>
          <AgendaTimeRuler gridConfig={gridConfig} />
        </div>

        {/* Day columns */}
        <div className="flex flex-1">
          {days.map((day) => {
            const { slotCount, slotHeightRem } = gridConfig;
            const totalHeightRem = slotCount * slotHeightRem;
            const hourInterval = slotHeightRem * 4;
            const positioned = computeLayout(day.appointments);
            const isClosed = day.isClosed || !day.salonIsOpen;

            return (
              <div
                key={day.date}
                className="relative flex-1 border-l border-gray-200 first:border-l-0"
                style={{
                  height: `${totalHeightRem}rem`,
                  minWidth: "7rem",
                  backgroundImage: isClosed
                    ? "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,.03) 4px, rgba(0,0,0,.03) 5px)"
                    : `repeating-linear-gradient(to bottom, transparent 0px, transparent calc(${hourInterval}rem - 1px), #e5e7eb calc(${hourInterval}rem - 1px), #e5e7eb ${hourInterval}rem)`,
                  backgroundColor: isClosed ? "rgba(249,250,251,0.9)" : undefined,
                }}
              >
                {isClosed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-gray-400">Fermé</span>
                  </div>
                )}
                {positioned.map((block) => (
                  <AgendaAppointmentBlock
                    key={block.id}
                    block={block}
                    gridConfig={gridConfig}
                    leftPct={block.leftPct}
                    widthPct={block.widthPct}
                    showEmployee
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 border-t border-gray-100 px-4 py-2">
        {data.employees.map((emp) => (
          <div key={emp.id} className="flex items-center gap-1 text-xs text-gray-600">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: emp.color ?? "#6366f1" }}
            />
            {emp.firstName}
          </div>
        ))}
      </div>
    </div>
  );
}
