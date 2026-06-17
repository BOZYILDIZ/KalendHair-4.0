"use client";

import type { EmployeeView } from "../types";

type Props = {
  employees: EmployeeView[];
};

export function EmployeeList({ employees }: Props) {
  const active = employees.filter((e) => e.isActive);
  const inactive = employees.filter((e) => !e.isActive);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {active.length === 0 && (
          <p className="text-sm text-gray-500">Aucun employé actif.</p>
        )}
        {active.map((employee) => (
          <a
            key={employee.id}
            href={`/dashboard/employees/${employee.id}`}
            className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
          >
            <span className="font-medium">
              {employee.firstName} {employee.lastName}
            </span>
            <span className="text-gray-400">→</span>
          </a>
        ))}
      </div>

      {inactive.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Inactifs ({inactive.length})
          </h2>
          {inactive.map((employee) => (
            <a
              key={employee.id}
              href={`/dashboard/employees/${employee.id}`}
              className="flex items-center justify-between rounded border px-4 py-3 text-sm text-gray-400 hover:bg-gray-50"
            >
              <span>
                {employee.firstName} {employee.lastName}
              </span>
              <span>→</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
