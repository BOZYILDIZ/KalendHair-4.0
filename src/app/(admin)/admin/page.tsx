import Link from "next/link";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import { redirect } from "next/navigation";
import { getAllOrganizations, getAdminAuditLogs } from "@/features/admin/admin.service";
import { getSubscriptionStats } from "@/features/admin/admin-metrics.service";
import { AdminAuditTable } from "@/features/admin/components/admin-audit-table";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [orgs, stats, recentLogs] = await Promise.all([
    getAllOrganizations(),
    getSubscriptionStats(),
    getAdminAuditLogs(undefined, 5),
  ]);

  const activeOrgs = orgs.filter((o) => o.isActive).length;
  const suspendedOrgs = orgs.filter((o) => !o.isActive).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-sm text-gray-500">Vue globale de la plateforme KalendHair</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Organisations actives" value={activeOrgs} color="green" />
        <StatCard label="Organisations suspendues" value={suspendedOrgs} color="red" />
        <StatCard label="Abonnements actifs" value={stats.byStatus.ACTIVE} color="blue" />
        <StatCard label="Plans gratuits" value={stats.freeCount} color="yellow" />
        <StatCard label="En essai" value={stats.byStatus.TRIAL} color="purple" />
        <StatCard label="Remises actives" value={stats.activeDiscountsCount} color="orange" />
        <StatCard label="Total abonnements" value={stats.total} color="gray" />
        <StatCard label="En retard" value={stats.byStatus.PAST_DUE} color="rose" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <QuickLink href="/admin/organizations" label="Organisations" desc="Gérer tous les tenants" />
        <QuickLink href="/admin/subscriptions" label="Abonnements" desc="Vue transversale" />
        <QuickLink href="/admin/metrics" label="Métriques" desc="MRR / ARR" />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Actions récentes</h2>
        <AdminAuditTable logs={recentLogs} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const borders: Record<string, string> = {
    green: "border-green-400",
    red: "border-red-400",
    blue: "border-blue-400",
    yellow: "border-yellow-400",
    purple: "border-purple-400",
    orange: "border-orange-400",
    gray: "border-gray-400",
    rose: "border-rose-400",
  };
  return (
    <div
      className={`rounded-lg border-l-4 bg-white p-4 shadow-sm ${borders[color] ?? "border-gray-300"}`}
    >
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  desc,
}: {
  href: string;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-sm text-gray-500">{desc}</p>
    </Link>
  );
}
