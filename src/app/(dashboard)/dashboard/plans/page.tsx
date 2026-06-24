import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getActivePlans, getCurrentSubscription } from "@/features/billing/billing.service";
import { PlanCard } from "@/features/billing/components/plan-card";

export default async function PlansPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [plans, subscription] = await Promise.all([
    getActivePlans(),
    getCurrentSubscription(session.organizationId),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Plans KalendHair</h1>
          <p className="text-sm text-gray-500">Choisissez le plan adapté à votre activité</p>
        </div>
        <Link
          href="/dashboard/billing"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Mon abonnement
        </Link>
      </div>

      {plans.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun plan disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={subscription?.planCode === plan.code}
            />
          ))}
        </div>
      )}
    </main>
  );
}
