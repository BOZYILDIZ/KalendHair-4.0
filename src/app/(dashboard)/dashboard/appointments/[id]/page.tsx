import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageAppointment } from "@/lib/permissions/appointment.permissions";
import { getAppointment } from "@/features/appointments/appointment.service";
import { AppointmentDetail } from "@/features/appointments/components/appointment-detail";
import {
  cancelAppointmentAction,
  updateStatusAction,
} from "./actions";
import { convertGuestAndRedirectAction } from "@/app/(dashboard)/dashboard/clients/[id]/actions";
import type { CancelFormState, StatusFormState } from "@/features/appointments/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageAppointment(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const appointment = await getAppointment(id, session.organizationId);
  if (!appointment) notFound();

  // Bound actions — inject appointmentId server-side
  const boundCancelAction = async (
    prevState: CancelFormState,
    formData: FormData,
  ): Promise<CancelFormState> => {
    "use server";
    formData.append("appointmentId", id);
    return cancelAppointmentAction(prevState, formData);
  };

  const boundStatusAction = async (
    prevState: StatusFormState,
    formData: FormData,
  ): Promise<StatusFormState> => {
    "use server";
    formData.append("appointmentId", id);
    return updateStatusAction(prevState, formData);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/appointments"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Retour
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Rendez-vous</h1>
      </div>

      <AppointmentDetail
        appointment={appointment}
        salonTimezone={salon.timezone}
        updateStatusAction={boundStatusAction}
        cancelAction={boundCancelAction}
        convertGuestAction={convertGuestAndRedirectAction}
      />
    </div>
  );
}
