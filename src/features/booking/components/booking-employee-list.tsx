import Link from "next/link";
import type { PublicEmployeeView } from "../types";

export function BookingEmployeeList({
  employees,
  salonSlug,
  serviceId,
}: {
  employees: PublicEmployeeView[];
  salonSlug: string;
  serviceId: string;
}) {
  return (
    <div className="mt-2">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Choisissez un coiffeur</h2>
      {employees.length === 0 ? (
        <>
          <p className="text-gray-500">Aucun coiffeur disponible pour cette prestation.</p>
          <Link
            href={`/book/${salonSlug}`}
            className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
          >
            ← Choisir une autre prestation
          </Link>
        </>
      ) : (
        <>
          <ul className="space-y-2">
            {employees.map((emp) => (
              <li key={emp.id}>
                <Link
                  href={`/book/${salonSlug}?serviceId=${serviceId}&employeeId=${emp.id}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  {emp.color && (
                    <span
                      className="h-4 w-4 shrink-0 rounded-full"
                      style={{ backgroundColor: emp.color }}
                    />
                  )}
                  <span className="font-medium text-gray-900">
                    {emp.firstName} {emp.lastName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`/book/${salonSlug}`}
            className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
          >
            ← Choisir une autre prestation
          </Link>
        </>
      )}
    </div>
  );
}
