import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getBillingDashboard } from "@/features/billing/billing.service";
import { BillingStatusBadge } from "@/features/billing/components/billing-status-badge";
import { BillingQuotaCard } from "@/features/billing/components/billing-quota-card";
import { BillingCurrentPlan } from "@/features/billing/components/billing-current-plan";
import { upgradePlanAction, changeBillingCycleAction } from "./actions";

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { subscription, quota, plans } = await getBillingDashboard(session.organizationId);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Abonnement</h1>
          <p className="text-sm text-gray-500">Gérez votre plan KalendHair</p>
        </div>
        <div className="flex items-center gap-3">
          {subscription && <BillingStatusBadge status={subscription.status} />}
          <Link
            href="/dashboard/plans"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Voir tous les plans
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BillingCurrentPlan
            subscription={subscription}
            plans={plans}
            upgradeAction={upgradePlanAction}
            changeCycleAction={changeBillingCycleAction}
          />
        </div>
        <div>
          <BillingQuotaCard quota={quota} />
        </div>
      </div>

      {!subscription && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500">
            Aucun abonnement actif.{" "}
            <Link href="/dashboard/plans" className="text-blue-600 hover:underline">
              Choisissez un plan
            </Link>{" "}
            pour débloquer toutes les fonctionnalités.
          </p>
        </div>
      )}
    </main>
  );
}
