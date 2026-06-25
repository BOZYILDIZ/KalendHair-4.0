import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import { prisma } from "@/lib/db/prisma";
import { SubscriptionAdminBadge } from "@/features/admin/components/subscription-admin-badge";

export default async function AdminSubscriptionsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const subs = await prisma.organizationSubscription.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      billingCycle: true,
      status: true,
      isFree: true,
      currentPeriodEnd: true,
      organization: { select: { id: true, name: true, isActive: true } },
      plan: { select: { code: true, name: true } },
      discounts: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
        <p className="text-sm text-gray-500">
          {subs.length} abonnement{subs.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Cycle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Fin période</th>
              <th className="px-4 py-3">Remise</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subs.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {sub.organization.name}
                  {!sub.organization.isActive && (
                    <span className="ml-2 rounded bg-red-100 px-1 py-0.5 text-xs text-red-700">
                      Suspendu
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SubscriptionAdminBadge
                    planCode={sub.plan.code}
                    status={sub.status}
                    isFree={sub.isFree}
                  />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {sub.billingCycle === "MONTHLY" ? "Mensuel" : "Annuel"}
                </td>
                <td className="px-4 py-3 text-gray-600">{sub.status}</td>
                <td className="px-4 py-3 text-gray-600">
                  {sub.currentPeriodEnd.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  {sub.discounts.length > 0 ? (
                    <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                      Active
                    </span>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/organizations/${sub.organization.id}/billing`}
                    className="text-blue-600 hover:underline"
                  >
                    Gérer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
