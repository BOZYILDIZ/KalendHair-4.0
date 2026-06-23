"use client";

import { useRouter } from "next/navigation";
import type { AgendaEmployeeView, AgendaView } from "../types";

type Props = {
  employees: AgendaEmployeeView[];
  employeeId: string | undefined;
  view: AgendaView;
  date: string;
};

export function AgendaEmployeeFilter({
  employees,
  employeeId,
  view,
  date,
}: Props) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams({ view, date });
    if (e.target.value) params.set("employeeId", e.target.value);
    router.push(`/dashboard/agenda?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500">Employé</label>
      <select
        value={employeeId ?? ""}
        onChange={handleChange}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Tous les employés</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.firstName} {e.lastName}
          </option>
        ))}
      </select>
    </div>
  );
}
