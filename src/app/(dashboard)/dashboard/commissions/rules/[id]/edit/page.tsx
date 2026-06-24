import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageCommissionRules } from "@/lib/permissions/commission.permissions";
import { getCommissionRule } from "@/features/commissions/commission-rule.service";
import { getEmployees } from "@/features/employees/employee.service";
import { getServices } from "@/features/services/service.service";
import { getProductSummaries } from "@/features/inventory/product.service";
import { CommissionRuleForm } from "@/features/commissions/components/commission-rule-form";
import { updateCommissionRuleAction } from "../../actions";
import type { RuleFormState } from "@/features/commissions/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCommissionRulePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageCommissionRules(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const [rule, employees, services, products] = await Promise.all([
    getCommissionRule(id, salon.id, session.organizationId),
    getEmployees(salon.id, session.organizationId),
    getServices(salon.id, session.organizationId),
    getProductSummaries(salon.id, session.organizationId),
  ]);

  if (!rule) notFound();

  const boundAction = async (
    prev: RuleFormState,
    formData: FormData,
  ): Promise<RuleFormState> => {
    "use server";
    formData.append("ruleId", id);
    return updateCommissionRuleAction(prev, formData);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/commissions/rules"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Règles de commission
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Modifier la règle</h1>
        <p className="mt-1 text-xs text-gray-400">
          Seuls le type et la valeur sont modifiables. Pour changer la cible, désactivez cette règle et créez-en une nouvelle.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <CommissionRuleForm
          action={boundAction}
          employees={employees.filter((e) => e.isActive)}
          services={services.filter((s) => s.isActive)}
          products={products}
          defaultValues={{
            employeeId: rule.employeeId ?? undefined,
            serviceId:  rule.serviceId  ?? undefined,
            productId:  rule.productId  ?? undefined,
            type:       rule.type,
            value:      rule.value,
          }}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
