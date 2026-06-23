import Link from "next/link";
import type { ClientListItem, ClientsPage } from "../types";

type Props = {
  data: ClientsPage;
  search?: string;
};

function buildPageUrl(page: number, search?: string): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/dashboard/clients${qs ? `?${qs}` : ""}`;
}

function ClientRow({ item }: { item: ClientListItem }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">
        <Link
          href={`/dashboard/clients/${item.id}`}
          className="font-medium text-indigo-600 hover:underline"
        >
          {item.firstName} {item.lastName}
        </Link>
        {!item.isActive && (
          <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
            Inactif
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{item.email}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{item.phone ?? "—"}</td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/dashboard/clients/${item.id}`}
          className="text-sm text-gray-400 hover:text-indigo-600"
        >
          →
        </Link>
      </td>
    </tr>
  );
}

export function ClientList({ data, search }: Props) {
  const { items, total, page, pageCount } = data;

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
        {search ? `Aucun client trouvé pour « ${search} ».` : "Aucun client enregistré dans ce salon."}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Nom
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Téléphone
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ClientRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">
            {total} client{total > 1 ? "s" : ""} — page {page}/{pageCount}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1, search)}
                className="rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                ← Précédent
              </Link>
            )}
            {page < pageCount && (
              <Link
                href={buildPageUrl(page + 1, search)}
                className="rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                Suivant →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
