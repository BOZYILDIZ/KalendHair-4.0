import type { PublicSalonView } from "../types";

export function BookingSalonHeader({ salon }: { salon: PublicSalonView }) {
  const location = [salon.address, salon.city].filter(Boolean).join(", ");

  return (
    <div className="border-b border-gray-200 pb-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{salon.name}</h1>
      {salon.description && (
        <p className="mt-1 text-sm text-gray-500">{salon.description}</p>
      )}
      {location && (
        <p className="mt-1 text-xs text-gray-400">{location}</p>
      )}
    </div>
  );
}
