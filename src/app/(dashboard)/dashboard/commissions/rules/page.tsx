import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageCommissionRules } from "@/lib/permissions/commission.permissions";
import { getCommissionRules } from "@/features/commissions/commission-rule.service";
import { CommissionRuleList } from "@/features/commissions/components/commission-rule-list";
import { deactivateCommissionRuleAction } from "./actions";

export default async function CommissionRulesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageCommissionRules(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const rules = await getCommissionRules(salon.id, session.organizationId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Règles de commission</h1>
          <p className="text-sm text-gray-500">{salon.name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/commissions"
            className="text-sm text-indigo-600 hover:underline"
          >
            {"← Vue d'ensemble"}
          </Link>
          <Link
            href="/dashboard/commissions/rules/new"
            className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Nouvelle règle
          </Link>
        </div>
      </div>

      {/* Règles actives */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Règles actives</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <CommissionRuleList
            rules={rules.active}
            deactivateAction={deactivateCommissionRuleAction}
          />
        </div>
      </section>

      {/* Règles inactives */}
      {rules.inactive.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Règles inactives</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-70">
            <CommissionRuleList
              rules={rules.inactive}
              deactivateAction={deactivateCommissionRuleAction}
            />
          </div>
        </section>
      )}
    </div>
  );
}
