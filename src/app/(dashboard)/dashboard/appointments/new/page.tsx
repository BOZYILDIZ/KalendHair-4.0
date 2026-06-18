import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageAppointment } from "@/lib/permissions/appointment.permissions";
import {
  getActiveServices,
  getServiceEmployeesMap,
} from "@/features/appointments/appointment.service";
import { AppointmentForm } from "@/features/appointments/components/appointment-form";
import { createAppointmentAction } from "./actions";

export default async function NewAppointmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageAppointment(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const [services, serviceEmployees] = await Promise.all([
    getActiveServices(salon.id, session.organizationId),
    getServiceEmployeesMap(salon.id, session.organizationId),
  ]);

  if (services.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-xl font-bold text-gray-900">Nouveau rendez-vous</h1>
        <p className="text-sm text-gray-600">
          Aucun service actif. Veuillez d&apos;abord{" "}
          <Link href="/dashboard/services/new" className="text-indigo-600 hover:underline">
            créer un service
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/appointments"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Retour
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nouveau rendez-vous</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <AppointmentForm
          services={services}
          serviceEmployees={serviceEmployees}
          action={createAppointmentAction}
        />
      </div>
    </div>
  );
}
