type Props = {
  quantity: number | null;
  threshold: number;
};

export function StockBadge({ quantity, threshold }: Props) {
  if (quantity === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        —
      </span>
    );
  }

  if (quantity === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Rupture
      </span>
    );
  }

  if (quantity <= threshold) {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
        {quantity} — Alerte
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
      {quantity}
    </span>
  );
}
