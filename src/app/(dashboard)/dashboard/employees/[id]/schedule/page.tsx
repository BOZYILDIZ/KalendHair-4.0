import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { canManageSchedule } from "@/lib/permissions/schedule.permissions";
import { getSalon } from "@/features/salons/salon.service";
import { getEmployee } from "@/features/employees/employee.service";
import { getSalonSchedule } from "@/features/schedules/salon-schedule.service";
import { getEmployeeSchedule } from "@/features/schedules/employee-schedule.service";
import { EmployeeScheduleForm } from "@/features/schedules/components/employee-schedule-form";
import { saveEmployeeScheduleAction } from "./actions";
import type { ScheduleFormState } from "@/features/schedules/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeSchedulePage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  if (!canManageSchedule(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const salon = await getSalon(session.organizationId);
  if (!salon) redirect("/dashboard/salon");

  const employee = await getEmployee(id, session.organizationId);
  if (!employee) redirect("/dashboard/employees");

  const salonSchedule = await getSalonSchedule(salon.id, session.organizationId);
  const employeeSchedule = await getEmployeeSchedule(id, session.organizationId, salonSchedule);

  const boundAction = async (
    prevState: ScheduleFormState,
    formData: FormData,
  ): Promise<ScheduleFormState> => {
    "use server";
    formData.append("employeeId", id);
    return saveEmployeeScheduleAction(prevState, formData);
  };

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">
          Horaires — {employee.firstName} {employee.lastName}
        </h1>
        <p className="text-sm text-gray-500">
          Les horaires de cet employé doivent rester dans les plages du salon.
        </p>
      </div>

      <EmployeeScheduleForm
        schedule={employeeSchedule}
        salonSchedule={salonSchedule}
        action={boundAction}
      />

      <div className="pt-2">
        <Link
          href={`/dashboard/employees/${id}`}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Retour à l&apos;employé
        </Link>
      </div>
    </main>
  );
}
