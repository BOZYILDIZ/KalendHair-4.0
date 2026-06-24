import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import { getOrganizationById } from "@/features/admin/admin.service";
import { ChangePlanForm } from "@/features/admin/components/change-plan-form";
import { GrantFreeForm } from "@/features/admin/components/grant-free-form";
import { CreateDiscountForm } from "@/features/admin/components/create-discount-form";
import { DiscountList } from "@/features/admin/components/discount-list";
import { ExtendTrialForm } from "@/features/admin/components/extend-trial-form";
import { prisma } from "@/lib/db/prisma";
import {
  changePlanAction,
  grantFreePlanAction,
  revokeFreePlanAction,
  createDiscountAction,
  deactivateDiscountAction,
  extendTrialAction,
} from "./actions";

export default async function AdminOrgBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const org = await getOrganizationById(id);
  if (!org) notFound();

  const allDiscounts = org.subscription
    ? await prisma.billingDiscount.findMany({
        where: { subscriptionId: org.subscription.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          value: true,
          reason: true,
          startDate: true,
          endDate: true,
          isActive: true,
          createdAt: true,
          createdByAdminId: true,
        },
      })
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Facturation — {org.name}
          </h1>
          <p className="text-sm text-gray-500">slug: {org.slug}</p>
        </div>
        <Link
          href={`/admin/organizations/${id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour fiche organisation
        </Link>
      </div>

      {!org.subscription && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-700">
          Cette organisation n&#39;a pas encore d&#39;abonnement. Créez-en un via
          &quot;Changer de plan&quot; ci-dessous.
        </div>
      )}

      {/* Changer de plan */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Changer de plan</h2>
        <ChangePlanForm
          orgId={id}
          currentPlanCode={org.subscription?.planCode ?? null}
          currentBillingCycle={org.subscription?.billingCycle ?? null}
          action={changePlanAction}
        />
      </section>

      {/* Plan gratuit */}
      {org.subscription && (
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Plan gratuit</h2>
          <GrantFreeForm
            orgId={id}
            isFree={org.subscription.isFree}
            freeReason={org.subscription.freeReason}
            grantAction={grantFreePlanAction}
            revokeAction={revokeFreePlanAction}
          />
        </section>
      )}

      {/* Remises */}
      {org.subscription && (
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Remises</h2>
          <DiscountList
            orgId={id}
            discounts={allDiscounts}
            deactivateAction={deactivateDiscountAction}
          />
          {!org.subscription.activeDiscount && (
            <div className="mt-6 border-t pt-6">
              <h3 className="mb-3 font-medium text-gray-700">
                Nouvelle remise
              </h3>
              <CreateDiscountForm
                orgId={id}
                subscriptionId={org.subscription.id}
                action={createDiscountAction}
              />
            </div>
          )}
        </section>
      )}

      {/* Extension essai */}
      {org.subscription && (
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            Extension période d&#39;essai
          </h2>
          {org.subscription.trialEndsAt && (
            <p className="mb-3 text-sm text-gray-500">
              Fin d&#39;essai actuelle :{" "}
              <strong>
                {org.subscription.trialEndsAt.toLocaleDateString("fr-FR")}
              </strong>
            </p>
          )}
          <ExtendTrialForm orgId={id} action={extendTrialAction} />
        </section>
      )}
    </div>
  );
}
