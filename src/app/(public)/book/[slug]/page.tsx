import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPublicSalon,
  getPublicServices,
  getPublicEmployeesForService,
  getPublicSlots,
} from "@/features/booking/booking.service";
import { BookingSalonHeader } from "@/features/booking/components/booking-salon-header";
import { BookingServiceList } from "@/features/booking/components/booking-service-list";
import { BookingEmployeeList } from "@/features/booking/components/booking-employee-list";
import { BookingDatePicker } from "@/features/booking/components/booking-date-picker";
import { BookingSlotPicker } from "@/features/booking/components/booking-slot-picker";

type SearchParams = {
  serviceId?: string;
  employeeId?: string;
  date?: string;
};

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const salon = await getPublicSalon(slug);
  if (!salon) notFound();

  const { serviceId, employeeId, date } = sp;

  // Step 1 — choose service
  if (!serviceId) {
    const services = await getPublicServices(salon.id, salon.organizationId);
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <BookingSalonHeader salon={salon} />
        <BookingServiceList services={services} salonSlug={slug} />
      </main>
    );
  }

  // Step 2 — choose employee
  if (!employeeId) {
    const employees = await getPublicEmployeesForService(
      salon.id,
      salon.organizationId,
      serviceId,
    );
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <BookingSalonHeader salon={salon} />
        <BookingEmployeeList
          employees={employees}
          salonSlug={slug}
          serviceId={serviceId}
        />
      </main>
    );
  }

  // Step 3 — choose date
  if (!date) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <BookingSalonHeader salon={salon} />
        <BookingDatePicker
          salonSlug={slug}
          serviceId={serviceId}
          employeeId={employeeId}
        />
      </main>
    );
  }

  // Step 4 — choose slot (date selected)
  const services = await getPublicServices(salon.id, salon.organizationId);
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <BookingSalonHeader salon={salon} />
        <p className="mt-4 text-sm text-red-600">Service introuvable.</p>
        <Link
          href={`/book/${slug}`}
          className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
        >
          ← Recommencer
        </Link>
      </main>
    );
  }

  const slots = await getPublicSlots(
    salon.id,
    salon.organizationId,
    employeeId,
    date,
    service.durationMinutes,
    salon.timezone,
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <BookingSalonHeader salon={salon} />
      <BookingSlotPicker
        slots={slots}
        salonSlug={slug}
        serviceId={serviceId}
        employeeId={employeeId}
        date={date}
      />
    </main>
  );
}
