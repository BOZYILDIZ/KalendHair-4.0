import Link from "next/link";
import type { PublicServiceView } from "../types";

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function BookingServiceList({
  services,
  salonSlug,
}: {
  services: PublicServiceView[];
  salonSlug: string;
}) {
  if (services.length === 0) {
    return <p className="mt-4 text-gray-500">Ce salon n&apos;a pas de prestations disponibles.</p>;
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Choisissez une prestation</h2>
      <ul className="space-y-2">
        {services.map((service) => (
          <li key={service.id}>
            <Link
              href={`/book/${salonSlug}?serviceId=${service.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{service.name}</p>
                <p className="text-sm text-gray-500">{service.durationMinutes} min</p>
              </div>
              <p className="font-semibold text-indigo-700">{formatEuros(service.priceCents)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
