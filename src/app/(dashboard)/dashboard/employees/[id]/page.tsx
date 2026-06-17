import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { getEmployee } from "@/features/employees/employee.service";
import { getServices } from "@/features/services/service.service";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { ServiceAssignment } from "@/features/employees/components/service-assignment";
import { StatusSection } from "@/features/employees/components/status-section";
import {
  updateEmployeeAction,
  deactivateEmployeeAction,
  reactivateEmployeeAction,
  syncServicesAction,
} from "./actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeePage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  const salon = await getSalon(session.organizationId);
  if (!salon) redirect("/dashboard/salon");

  const [employee, salonServices] = await Promise.all([
    getEmployee(id, session.organizationId),
    getServices(salon.id, session.organizationId),
  ]);

  if (!employee) redirect("/dashboard/employees");

  // Bound actions with employeeId injected
  const boundUpdateAction = async (
    prevState: Awaited<ReturnType<typeof updateEmployeeAction>>,
    formData: FormData,
  ) => {
    "use server";
    formData.append("employeeId", id);
    return updateEmployeeAction(prevState, formData);
  };

  const boundDeactivateAction = async (
    prevState: Awaited<ReturnType<typeof deactivateEmployeeAction>>,
    formData: FormData,
  ) => {
    "use server";
    formData.append("employeeId", id);
    return deactivateEmployeeAction(prevState, formData);
  };

  const boundReactivateAction = async (
    prevState: Awaited<ReturnType<typeof reactivateEmployeeAction>>,
    formData: FormData,
  ) => {
    "use server";
    formData.append("employeeId", id);
    return reactivateEmployeeAction(prevState, formData);
  };

  const boundSyncAction = async (
    prevState: Awaited<ReturnType<typeof syncServicesAction>>,
    formData: FormData,
  ) => {
    "use server";
    formData.append("employeeId", id);
    return syncServicesAction(prevState, formData);
  };

  return (
    <main className="mx-auto max-w-lg space-y-8 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">
          {employee.firstName} {employee.lastName}
        </h1>
        <p className="text-sm text-gray-500">
          {employee.isActive ? (
            <span className="text-green-600">Actif</span>
          ) : (
            <span className="text-gray-400">Inactif</span>
          )}
        </p>
      </div>

      {/* Section 1 : Informations */}
      <section className="space-y-4">
        <h2 className="border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Informations
        </h2>
        <EmployeeForm employee={employee} action={boundUpdateAction} />
      </section>

      {/* Section 2 : Services */}
      <section className="space-y-4">
        <h2 className="border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Services associés
        </h2>
        <ServiceAssignment
          employeeIsActive={employee.isActive}
          salonServices={salonServices}
          assignedServiceIds={employee.serviceIds}
          action={boundSyncAction}
        />
      </section>

      {/* Section 3 : Statut */}
      <section className="space-y-4">
        <h2 className="border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Statut
        </h2>
        <StatusSection
          employeeId={id}
          isActive={employee.isActive}
          deactivateAction={boundDeactivateAction}
          reactivateAction={boundReactivateAction}
        />
      </section>

      <Link
        href="/dashboard/employees"
        className="block text-sm text-gray-400 hover:underline"
      >
        ← Retour aux employés
      </Link>
    </main>
  );
}
