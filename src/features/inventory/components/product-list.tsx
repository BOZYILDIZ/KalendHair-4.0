import Link from "next/link";
import type { ProductView } from "../types";
import { StockBadge } from "./stock-badge";

type Props = {
  products: ProductView[];
};

export function ProductList({ products }: Props) {
  if (products.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">
        Aucun produit trouvé.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Produit</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Catégorie</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">Prix</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">Stock</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
              <td className="px-4 py-3 text-gray-500">{p.categoryName ?? "—"}</td>
              <td className="px-4 py-3 text-right text-gray-700">
                {(p.priceCents / 100).toFixed(2)} €
              </td>
              <td className="px-4 py-3 text-center">
                <StockBadge quantity={p.currentStock} threshold={p.lowStockThreshold} />
              </td>
              <td className="px-4 py-3">
                {p.isActive ? (
                  <span className="text-green-600">Actif</span>
                ) : (
                  <span className="text-gray-400">Inactif</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/inventory/products/${p.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  Voir →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
