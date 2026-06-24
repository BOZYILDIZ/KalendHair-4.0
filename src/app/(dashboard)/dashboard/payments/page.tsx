import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePayment } from "@/lib/permissions/payment.permissions";
import { canUsePayments } from "@/lib/permissions/billing.permissions";
import { getPayments } from "@/features/payments/payment.service";
import { PaymentHistoryTable } from "@/features/payments/components/payment-history-table";
import type { PaymentFilters, PaymentMethod, PaymentStatus } from "@/features/payments/types";

type Props = {
  searchParams: Promise<{
    method?: string;
    status?: string;
    from?:   string;
    to?:     string;
    page?:   string;
  }>;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function PaymentsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [salon, billingOk] = await Promise.all([
    getSalon(session.organizationId),
    canUsePayments(session.organizationId),
  ]);
  if (!salon || !canManagePayment(session, session.organizationId)) {
    redirect("/dashboard");
  }
  if (!billingOk) redirect("/dashboard/billing");

  const sp = await searchParams;

  const now      = new Date();
  const today    = new Intl.DateTimeFormat("fr-CA").format(now);
  const dayMinus30 = new Intl.DateTimeFormat("fr-CA").format(
    new Date(now.getTime() - 30 * 24 * 60 * 60_000),
  );

  const filters: PaymentFilters = {
    method: (sp.method as PaymentMethod | "ALL" | undefined) ?? "ALL",
    status: (sp.status as PaymentStatus | "ALL" | undefined) ?? "ALL",
    from:   sp.from ?? dayMinus30,
    to:     sp.to   ?? today,
    page:   sp.page ? Math.max(1, parseInt(sp.page, 10)) : 1,
  };

  const result = await getPayments(salon.id, session.organizationId, filters);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Caisse</h1>
        <Link
          href="/dashboard/payments/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Paiement libre
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">Du</label>
          <input
            type="date"
            name="from"
            defaultValue={filters.from}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Au</label>
          <input
            type="date"
            name="to"
            defaultValue={filters.to}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Méthode</label>
          <select
            name="method"
            defaultValue={filters.method ?? "ALL"}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="ALL">Toutes</option>
            <option value="CASH">Espèces</option>
            <option value="CARD">CB</option>
            <option value="TRANSFER">Virement</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Statut</label>
          <select
            name="status"
            defaultValue={filters.status ?? "ALL"}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="ALL">Tous</option>
            <option value="COMPLETED">Soldé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filtrer
        </button>
        <Link
          href="/dashboard/payments"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Réinitialiser
        </Link>
      </form>

      {/* KPI résumé */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-indigo-50 px-5 py-3">
        <span className="text-sm text-indigo-700 font-medium">
          {result.total} paiement{result.total > 1 ? "s" : ""} sur la période
        </span>
        <span className="text-sm font-bold text-indigo-900">
          CA encaissé : {formatEuros(result.totalAmountCents)}
        </span>
      </div>

      {/* Table */}
      <PaymentHistoryTable items={result.items} totalAmountCents={result.totalAmountCents} />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Page {result.page} / {result.totalPages}</span>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                href={`?from=${filters.from}&to=${filters.to}&method=${filters.method}&status=${filters.status}&page=${result.page - 1}`}
                className="rounded border px-3 py-1 hover:bg-gray-50"
              >
                ← Précédent
              </Link>
            )}
            {result.page < result.totalPages && (
              <Link
                href={`?from=${filters.from}&to=${filters.to}&method=${filters.method}&status=${filters.status}&page=${result.page + 1}`}
                className="rounded border px-3 py-1 hover:bg-gray-50"
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
