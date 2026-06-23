"use client";

import { useRouter } from "next/navigation";
import type { Period } from "../types";

const OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "week",  label: "Semaine" },
  { value: "month", label: "Mois" },
];

type Props = { period: Period };

export function KpiPeriodSelector({ period }: Props) {
  const router = useRouter();

  return (
    <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => router.push(`/dashboard/kpi?period=${o.value}`)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            period === o.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
