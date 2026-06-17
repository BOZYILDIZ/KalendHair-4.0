"use client";

import type { ServiceView } from "../types";

type Props = {
  services: ServiceView[];
};

function formatPrice(priceCents: number): string {
  return (priceCents / 100).toFixed(2) + " €";
}

export function ServiceList({ services }: Props) {
  const active = services.filter((s) => s.isActive);
  const inactive = services.filter((s) => !s.isActive);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {active.length === 0 && (
          <p className="text-sm text-gray-500">Aucun service actif.</p>
        )}
        {active.map((service) => (
          <a
            key={service.id}
            href={`/dashboard/services/${service.id}`}
            className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
          >
            <span className="font-medium">{service.name}</span>
            <span className="text-gray-400">
              {service.durationMinutes} min · {formatPrice(service.priceCents)}{" "}
              →
            </span>
          </a>
        ))}
      </div>

      {inactive.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Inactifs ({inactive.length})
          </h2>
          {inactive.map((service) => (
            <a
              key={service.id}
              href={`/dashboard/services/${service.id}`}
              className="flex items-center justify-between rounded border px-4 py-3 text-sm text-gray-400 hover:bg-gray-50"
            >
              <span>{service.name}</span>
              <span>→</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
