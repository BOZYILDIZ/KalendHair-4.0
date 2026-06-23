import Link from "next/link";
import type { AgendaBlock, GridConfig } from "../types";

function formatMinute(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type Props = {
  block: AgendaBlock;
  gridConfig: GridConfig;
  leftPct: number;
  widthPct: number;
  showEmployee?: boolean;
};

const STATUS_BG: Record<string, string> = {
  PENDING:   "bg-yellow-50",
  CONFIRMED: "bg-white",
  CANCELLED: "bg-gray-100",
  NO_SHOW:   "bg-red-50",
  COMPLETED: "bg-blue-50",
};

const STATUS_TEXT: Record<string, string> = {
  PENDING:   "text-gray-800",
  CONFIRMED: "text-gray-900",
  CANCELLED: "text-gray-400",
  NO_SHOW:   "text-red-700",
  COMPLETED: "text-gray-600",
};

export function AgendaAppointmentBlock({
  block,
  gridConfig,
  leftPct,
  widthPct,
  showEmployee = false,
}: Props) {
  const { startMinute, endMinute, durationMinutes, status, employeeColor } = block;

  const topRem =
    ((startMinute - gridConfig.startMinute) / 15) * gridConfig.slotHeightRem;
  const slots = Math.max(1, Math.ceil(durationMinutes / 15));
  const heightRem = slots * gridConfig.slotHeightRem - 0.125;

  const isActive = status !== "CANCELLED" && status !== "NO_SHOW";

  const borderColor = isActive
    ? employeeColor
    : status === "CANCELLED"
      ? "#9ca3af"
      : "#f87171";

  const bgClass = STATUS_BG[status] ?? "bg-white";
  const textClass = STATUS_TEXT[status] ?? "text-gray-900";

  const cancelledClass = status === "CANCELLED" ? "line-through opacity-70" : "";
  const noShowClass = status === "NO_SHOW" ? "italic" : "";

  // Clamp: if block starts before grid or ends after, skip rendering
  if (startMinute >= gridConfig.endMinute || endMinute <= gridConfig.startMinute) {
    return null;
  }

  return (
    <Link
      href={`/dashboard/appointments/${block.id}`}
      className={`absolute overflow-hidden rounded-sm border-l-4 p-1 text-xs shadow-sm transition-opacity hover:opacity-80 ${bgClass} ${textClass} ${cancelledClass} ${noShowClass}`}
      style={{
        top: `${topRem}rem`,
        height: `${heightRem}rem`,
        left: `${leftPct}%`,
        width: `calc(${widthPct}% - 4px)`,
        borderLeftColor: borderColor,
      }}
      title={`${formatMinute(startMinute)} – ${formatMinute(endMinute)} · ${block.clientName} · ${block.serviceName}`}
    >
      <div className="truncate font-medium">{formatMinute(startMinute)}</div>
      {durationMinutes >= 30 && (
        <div className="truncate">
          {showEmployee ? block.employeeFirstName : block.clientName}
        </div>
      )}
      {durationMinutes >= 45 && (
        <div className="truncate text-gray-500">{block.serviceName}</div>
      )}
      {status === "NO_SHOW" && (
        <div className="font-medium text-red-600">Absent</div>
      )}
    </Link>
  );
}
