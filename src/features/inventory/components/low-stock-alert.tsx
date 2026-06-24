import type { LowStockProduct } from "../types";

type Props = {
  products: LowStockProduct[];
};

export function LowStockAlert({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-yellow-800">
        ⚠ {products.length} produit{products.length > 1 ? "s" : ""} en alerte de stock
      </h3>
      <ul className="space-y-1">
        {products.map((p) => (
          <li key={p.id} className="text-sm text-yellow-700">
            <span className="font-medium">{p.name}</span> — {p.currentStock} {p.unit}
            {p.currentStock === 0 ? " (rupture)" : ` (seuil : ${p.lowStockThreshold})`}
          </li>
        ))}
      </ul>
    </div>
  );
}
