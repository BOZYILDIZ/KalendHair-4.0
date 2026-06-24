import Link from "next/link";
import type { SupplierView } from "../types";

type Props = {
  suppliers: SupplierView[];
  total: number;
  page: number;
  pageSize: number;
};

export function SupplierList({ suppliers, total, page, pageSize }: Props) {
  if (suppliers.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-gray-500">
        Aucun fournisseur. Créez-en un pour commencer.
      </p>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nom</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Téléphone</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.contactName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{s.email ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{s.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  {s.isActive ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Actif
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      Inactif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/suppliers/${s.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <p className="text-center text-xs text-gray-500">
          Page {page} / {totalPages} — {total} fournisseur{total > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
