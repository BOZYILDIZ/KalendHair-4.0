export const BOOKING_LEAD_MINUTES = 30;

export type PublicSalonView = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  timezone: string;
};

export type PublicServiceView = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};

export type PublicEmployeeView = {
  id: string;
  firstName: string;
  lastName: string;
  color: string | null;
};

export type PublicBookingInput = {
  serviceId: string;
  employeeId: string;
  date: string;
  slot: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type BookingStep = "service" | "employee" | "date" | "slot" | "confirm";

export type PublicBookingFormState = {
  success: boolean;
  error?: string;
};
