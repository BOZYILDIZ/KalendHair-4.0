import { AgendaAppointmentBlock } from "./agenda-appointment-block";
import type { AgendaBlock, AgendaColumn, GridConfig } from "../types";

type PositionedBlock = AgendaBlock & { leftPct: number; widthPct: number };

function computeLayout(blocks: AgendaBlock[]): PositionedBlock[] {
  const active = blocks.filter(
    (b) => b.status !== "CANCELLED" && b.status !== "NO_SHOW",
  );
  const inactive = blocks.filter(
    (b) => b.status === "CANCELLED" || b.status === "NO_SHOW",
  );

  const sorted = [...active].sort((a, b) => a.startMinute - b.startMinute);

  // Greedy interval grouping for overlap detection
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

  // Inactive blocks get full width
  for (const block of inactive) {
    result.push({ ...block, leftPct: 0, widthPct: 100 });
  }

  return result;
}

type Props = {
  column: AgendaColumn;
  gridConfig: GridConfig;
};

export function AgendaEmployeeColumn({ column, gridConfig }: Props) {
  const { startMinute, slotCount, slotHeightRem } = gridConfig;
  const totalHeightRem = slotCount * slotHeightRem;
  const hourInterval = slotHeightRem * 4; // 4 slots of 15 min = 1 hour

  const positioned = computeLayout(column.appointments);

  // Compute out-of-schedule overlay zones (before start / after end)
  const hasSchedule =
    column.isWorking &&
    column.scheduleStart !== null &&
    column.scheduleEnd !== null;

  const beforeEndRem = hasSchedule
    ? ((column.scheduleStart! - startMinute) / 15) * slotHeightRem
    : 0;
  const afterStartRem = hasSchedule
    ? ((column.scheduleEnd! - startMinute) / 15) * slotHeightRem
    : 0;

  return (
    <div
      className="relative flex-1 border-l border-gray-200"
      style={{
        height: `${totalHeightRem}rem`,
        minWidth: "8rem",
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent calc(${hourInterval}rem - 1px), #e5e7eb calc(${hourInterval}rem - 1px), #e5e7eb ${hourInterval}rem)`,
      }}
    >
      {/* Repos overlay */}
      {!column.isWorking && (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,.04) 4px, rgba(0,0,0,.04) 5px)",
            backgroundColor: "rgba(243,244,246,0.85)",
          }}
        >
          <span className="text-xs font-medium text-gray-400">Repos</span>
        </div>
      )}

      {/* Out-of-schedule zones (before / after employee hours) */}
      {column.isWorking && beforeEndRem > 0 && (
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-[5]"
          style={{
            height: `${beforeEndRem}rem`,
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,.03) 4px, rgba(0,0,0,.03) 5px)",
            backgroundColor: "rgba(249,250,251,0.7)",
          }}
        />
      )}
      {column.isWorking && afterStartRem > 0 && afterStartRem < totalHeightRem && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-[5]"
          style={{
            top: `${afterStartRem}rem`,
            bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,.03) 4px, rgba(0,0,0,.03) 5px)",
            backgroundColor: "rgba(249,250,251,0.7)",
          }}
        />
      )}

      {/* Appointment blocks */}
      {positioned.map((block) => (
        <AgendaAppointmentBlock
          key={block.id}
          block={block}
          gridConfig={gridConfig}
          leftPct={block.leftPct}
          widthPct={block.widthPct}
        />
      ))}
    </div>
  );
}
