import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePayment } from "@/lib/permissions/payment.permissions";
import { getAppointment } from "@/features/appointments/appointment.service";
import { getPaymentSummaryForAppointment } from "@/features/payments/payment.service";
import { AppointmentPaymentForm } from "@/features/payments/components/payment-form";
import { AppointmentPaymentStateBadge } from "@/features/payments/components/payment-status-badge";
import { createAppointmentPaymentAction } from "./actions";
import type { PaymentFormState } from "@/features/payments/types";

type Props = {
  params: Promise<{ id: string }>;
};

const PAYABLE_STATUSES = new Set(["CONFIRMED", "COMPLETED"]);

function centsToEuros(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default async function AppointmentPayPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePayment(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const appointment = await getAppointment(id, session.organizationId);
  if (!appointment) notFound();

  // NO_SHOW and other non-payable statuses → redirect back
  if (!PAYABLE_STATUSES.has(appointment.status)) {
    redirect(`/dashboard/appointments/${id}`);
  }

  const expectedCents = appointment.priceCentsSnapshot ?? appointment.service.priceCents;
  const summary = await getPaymentSummaryForAppointment(salon.id, id, expectedCents);

  const remainingCents = Math.max(0, expectedCents - summary.totalPaidCents);
  const excessCents    = summary.totalPaidCents > expectedCents
    ? summary.totalPaidCents - expectedCents
    : 0;

  const boundAction = async (
    prev: PaymentFormState,
    formData: FormData,
  ): Promise<PaymentFormState> => {
    "use server";
    formData.append("appointmentId", id);
    return createAppointmentPaymentAction(prev, formData);
  };

  const clientName = appointment.clientId
    ? `${appointment.guestFirstName ?? ""} ${appointment.guestLastName ?? ""}`.trim()
    : [appointment.guestFirstName, appointment.guestLastName].filter(Boolean).join(" ");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Nav */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/dashboard/appointments/${id}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Rendez-vous
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Encaissement</h1>
      </div>

      {/* Appointment context */}
      <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900">{appointment.service.name}</p>
            {clientName && <p className="text-gray-500">{clientName}</p>}
            <p className="mt-1 text-xs text-gray-400 capitalize">
              {new Intl.DateTimeFormat("fr-FR", {
                day: "2-digit", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              }).format(appointment.startAt)}
            </p>
          </div>
          <AppointmentPaymentStateBadge
            state={summary.state}
            remainingCents={summary.state === "partial" ? remainingCents : undefined}
            excessCents={summary.state === "overpaid" ? excessCents : undefined}
          />
        </div>
      </div>

      {/* Payment form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <AppointmentPaymentForm
          action={boundAction}
          serviceName={appointment.service.name}
          expectedEuros={centsToEuros(expectedCents)}
          paidEuros={centsToEuros(summary.totalPaidCents)}
          remainingEuros={centsToEuros(remainingCents)}
          isPaid={summary.state === "paid"}
        />
      </div>
    </div>
  );
}
