import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canUseDashboard } from "@/lib/permissions/billing.permissions";
import { getDashboardKpi } from "@/features/dashboard/dashboard.service";
import { KpiPeriodSelector } from "@/features/dashboard/components/kpi-period-selector";
import { KpiRevenueCard } from "@/features/dashboard/components/kpi-revenue-card";
import { KpiAppointmentsCard } from "@/features/dashboard/components/kpi-appointments-card";
import { KpiClientsCard } from "@/features/dashboard/components/kpi-clients-card";
import { KpiFillRateCard } from "@/features/dashboard/components/kpi-fill-rate-card";
import { KpiTopServicesCard } from "@/features/dashboard/components/kpi-top-services-card";
import { KpiTopEmployeesCard } from "@/features/dashboard/components/kpi-top-employees-card";
import { KpiCommissionCard } from "@/features/dashboard/components/kpi-commission-card";
import type { Period } from "@/features/dashboard/types";

type Props = {
  searchParams: Promise<{ period?: string }>;
};

function isValidPeriod(p: string | undefined): p is Period {
  return p === "today" || p === "week" || p === "month";
}

export default async function KpiPage({ searchParams }: Props) {
  const session = await requireSession();
  const [salon, allowed] = await Promise.all([
    getSalon(session.organizationId),
    canUseDashboard(session.organizationId),
  ]);
  if (!salon) redirect("/dashboard");
  if (!allowed) redirect("/dashboard/billing");

  const sp     = await searchParams;
  const period: Period = isValidPeriod(sp.period) ? sp.period : "week";

  const kpi = await getDashboardKpi(salon.id, session.organizationId, period, salon.timezone);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">KPI & Tableau de bord</h1>
          <p className="text-sm text-gray-500">{salon.name}</p>
        </div>
        <KpiPeriodSelector period={period} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <KpiRevenueCard      revenueCents={kpi.revenueCents} />
        <KpiAppointmentsCard counts={kpi.counts} />
        <KpiClientsCard
          newClients={kpi.newClients}
          recurringClients={kpi.recurringClients}
        />
        <KpiFillRateCard fillRate={kpi.fillRate} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <KpiTopServicesCard  services={kpi.topServices} />
        <KpiTopEmployeesCard employees={kpi.topEmployees} />
        <KpiCommissionCard   commissions={kpi.commissions} />
      </div>
    </main>
  );
}

