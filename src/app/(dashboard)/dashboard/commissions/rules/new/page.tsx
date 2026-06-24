import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageCommissionRules } from "@/lib/permissions/commission.permissions";
import { getEmployees } from "@/features/employees/employee.service";
import { getServices } from "@/features/services/service.service";
import { getProductSummaries } from "@/features/inventory/product.service";
import { CommissionRuleForm } from "@/features/commissions/components/commission-rule-form";
import { createCommissionRuleAction } from "../actions";

export default async function NewCommissionRulePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageCommissionRules(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const [employees, services, products] = await Promise.all([
    getEmployees(salon.id, session.organizationId),
    getServices(salon.id, session.organizationId),
    getProductSummaries(salon.id, session.organizationId),
  ]);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/commissions/rules"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Règles de commission
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Nouvelle règle</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <CommissionRuleForm
          action={createCommissionRuleAction}
          employees={employees.filter((e) => e.isActive)}
          services={services.filter((s) => s.isActive)}
          products={products}
          submitLabel="Créer la règle"
        />
      </div>
    </div>
  );
}
