import type { GridConfig } from "../types";

type Props = {
  gridConfig: GridConfig;
};

function formatMinute(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function AgendaTimeRuler({ gridConfig }: Props) {
  const { startMinute, endMinute, slotHeightRem } = gridConfig;
  const totalHeight = ((endMinute - startMinute) / 15) * slotHeightRem;

  // Collect every full hour within the grid range
  const firstHour = Math.ceil(startMinute / 60) * 60;
  const labels: number[] = [];
  for (let m = firstHour; m <= endMinute; m += 60) {
    labels.push(m);
  }

  return (
    <div
      className="relative flex-none select-none"
      style={{ width: "4rem", height: `${totalHeight}rem` }}
    >
      {labels.map((minute) => {
        const topRem = ((minute - startMinute) / 15) * slotHeightRem;
        return (
          <div
            key={minute}
            className="absolute right-2 text-xs text-gray-400"
            style={{ top: `${topRem}rem`, transform: "translateY(-50%)" }}
          >
            {formatMinute(minute)}
          </div>
        );
      })}
    </div>
  );
}
