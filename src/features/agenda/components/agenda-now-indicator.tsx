"use client";

import { useEffect, useState } from "react";
import type { GridConfig } from "../types";

type Props = {
  timezone: string;
  gridConfig: GridConfig;
  initialNowMinute: number;
};

function getNowMinute(timezone: string): number {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

export function AgendaNowIndicator({ timezone, gridConfig, initialNowMinute }: Props) {
  const [nowMinute, setNowMinute] = useState(initialNowMinute);

  useEffect(() => {
    const id = setInterval(() => {
      setNowMinute(getNowMinute(timezone));
    }, 60_000);
    return () => clearInterval(id);
  }, [timezone]);

  const { startMinute, endMinute, slotHeightRem } = gridConfig;

  if (nowMinute < startMinute || nowMinute > endMinute) return null;

  const topRem = ((nowMinute - startMinute) / 15) * slotHeightRem;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
      style={{ top: `${topRem}rem` }}
    >
      <div className="h-2 w-2 rounded-full bg-red-500" />
      <div className="h-px flex-1 bg-red-500 opacity-80" />
    </div>
  );
}
