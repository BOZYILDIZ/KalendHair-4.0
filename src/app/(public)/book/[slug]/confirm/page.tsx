import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  getPublicSalon,
  getPublicServices,
  getPublicEmployeesForService,
} from "@/features/booking/booking.service";
import { BookingSalonHeader } from "@/features/booking/components/booking-salon-header";
import { BookingForm } from "@/features/booking/components/booking-form";
import { bookAppointmentAction } from "./actions";
import { minutesToTime } from "@/lib/utils/time";
import type { PublicBookingFormState } from "@/features/booking/types";

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

type SearchParams = {
  serviceId?: string;
  employeeId?: string;
  date?: string;
  slot?: string;
};

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const { serviceId, employeeId, date, slot } = await searchParams;

  if (!serviceId || !employeeId || !date || !slot) {
    redirect(`/book/${slug}`);
  }

  const salon = await getPublicSalon(slug);
  if (!salon) notFound();

  const [services, employees] = await Promise.all([
    getPublicServices(salon.id, salon.organizationId),
    getPublicEmployeesForService(salon.id, salon.organizationId, serviceId),
  ]);

  const service = services.find((s) => s.id === serviceId);
  const employee = employees.find((e) => e.id === employeeId);

  if (!service || !employee) {
    redirect(`/book/${slug}`);
  }

  const slotMinutes = parseInt(slot, 10);
  const startTime = minutesToTime(slotMinutes);
  const parts = date.split("-");
  const displayDate = `${parts[2] ?? ""}/${parts[1] ?? ""}/${parts[0] ?? ""}`;

  // organizationId never comes from the client — bound server-side here
  const boundAction = bookAppointmentAction.bind(
    null,
    salon.id,
    salon.organizationId,
    slug,
  ) as (_prevState: PublicBookingFormState, formData: FormData) => Promise<PublicBookingFormState>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <BookingSalonHeader salon={salon} />

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="text-sm font-semibold text-gray-700">Récapitulatif</h2>
        <dl className="mt-2 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <dt>Prestation</dt>
            <dd>{service.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Coiffeur</dt>
            <dd>
              {employee.firstName} {employee.lastName}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Date</dt>
            <dd>
              {displayDate} à {startTime}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Durée</dt>
            <dd>{service.durationMinutes} min</dd>
          </div>
          <div className="flex justify-between font-medium text-gray-900">
            <dt>Prix</dt>
            <dd>{formatEuros(service.priceCents)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-2">
        <Link
          href={`/book/${slug}?serviceId=${serviceId}&employeeId=${employeeId}&date=${date}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Modifier le créneau
        </Link>
      </div>

      <BookingForm
        bookingAction={boundAction}
        serviceId={serviceId}
        employeeId={employeeId}
        date={date}
        slot={slot}
      />
    </main>
  );
}
