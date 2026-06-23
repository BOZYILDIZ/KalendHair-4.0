import type { AppointmentStatus } from "@/features/appointments/types";

export type ClientListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  salonClientId: string;
  notes: string | null;
  createdAt: string;
};

export type ClientView = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  salonClientId: string;
  notes: string | null;
  salonClientIsActive: boolean;
  memberSince: string;
};

export type ClientStats = {
  totalAppointments: number;
  totalSpentCents: number;
  cancellationCount: number;
  noShowCount: number;
  lastVisitAt: string | null;
};

export type ClientAppointmentRow = {
  id: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  serviceName: string;
  effectivePriceCents: number;
  employeeFirstName: string;
  employeeLastName: string;
};

export type ClientsPage = {
  items: ClientListItem[];
  total: number;
  page: number;
  pageCount: number;
};

export type ClientAppointmentsPage = {
  items: ClientAppointmentRow[];
  total: number;
  page: number;
  pageCount: number;
};

export type ClientNotesFormState = {
  success: boolean;
  error?: string;
};

export type ConvertGuestFormState = {
  success: boolean;
  error?: string;
  clientId?: string;
};
