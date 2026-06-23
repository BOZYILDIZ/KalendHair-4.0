import { toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/db/prisma";
import {
  getActiveServices,
  getEmployeesForService,
  createAppointment,
  type CreateResult,
} from "@/features/appointments/appointment.service";
import { getAvailableSlots } from "@/features/appointments/slots.service";
import { minutesToTime } from "@/lib/utils/time";
import type { CreateAppointmentInput } from "@/features/appointments/appointment.schema";
import type {
  PublicSalonView,
  PublicServiceView,
  PublicEmployeeView,
  PublicBookingInput,
} from "./types";
import { BOOKING_LEAD_MINUTES } from "./types";

export async function getPublicSalon(slug: string): Promise<PublicSalonView | null> {
  const salon = await prisma.salon.findUnique({
    where: { slug },
    select: {
      id: true,
      organizationId: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      city: true,
      phone: true,
      timezone: true,
      isActive: true,
    },
  });
  if (!salon || !salon.isActive) return null;
  return {
    id: salon.id,
    organizationId: salon.organizationId,
    name: salon.name,
    slug: salon.slug,
    description: salon.description,
    address: salon.address,
    city: salon.city,
    phone: salon.phone,
    timezone: salon.timezone,
  };
}

export async function getPublicServices(
  salonId: string,
  organizationId: string,
): Promise<PublicServiceView[]> {
  return getActiveServices(salonId, organizationId);
}

export async function getPublicEmployeesForService(
  salonId: string,
  organizationId: string,
  serviceId: string,
): Promise<PublicEmployeeView[]> {
  return getEmployeesForService(salonId, serviceId, organizationId);
}

export async function getPublicSlots(
  salonId: string,
  organizationId: string,
  employeeId: string,
  date: string,
  durationMinutes: number,
  salonTimezone: string,
): Promise<number[]> {
  // Exigence fonctionnelle 1 : date passée interdite
  const todayInSalon = new Intl.DateTimeFormat("fr-CA", {
    timeZone: salonTimezone,
  }).format(new Date());

  if (date < todayInSalon) return [];

  const slots = await getAvailableSlots(
    salonId,
    organizationId,
    employeeId,
    date,
    durationMinutes,
  );

  // Exigence fonctionnelle 2 : créneaux passés interdits pour aujourd'hui
  if (date === todayInSalon) {
    const nowZoned = toZonedTime(new Date(), salonTimezone);
    const nowMinutes = nowZoned.getHours() * 60 + nowZoned.getMinutes();
    const cutoff = nowMinutes + BOOKING_LEAD_MINUTES;
    return slots.filter((slot) => slot >= cutoff);
  }

  return slots;
}

export async function createPublicAppointment(
  salonId: string,
  organizationId: string,
  data: PublicBookingInput,
): Promise<CreateResult> {
  const input: CreateAppointmentInput = {
    employeeId: data.employeeId,
    serviceId: data.serviceId,
    date: data.date,
    startTime: minutesToTime(data.slot),
    guestFirstName: data.firstName,
    guestLastName: data.lastName,
    guestEmail: data.email,
    guestPhone: data.phone,
  };

  // createAppointment captures priceCentsSnapshot = service.priceCents automatically
  return createAppointment(salonId, organizationId, input);
}
