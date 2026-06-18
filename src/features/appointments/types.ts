export const SLOT_INTERVAL_MINUTES = 15;

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "NO_SHOW"
  | "COMPLETED";

export type AppointmentModificationType =
  | "CREATED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "STATUS_CHANGED"
  | "NOTE_UPDATED";

// Valid transitions per status
export const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING:   ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "NO_SHOW", "COMPLETED"],
  CANCELLED: [],
  NO_SHOW:   [],
  COMPLETED: [],
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING:   "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  NO_SHOW:   "Absent",
  COMPLETED: "Terminé",
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-500",
  NO_SHOW:   "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export type AppointmentListView = {
  id: string;
  organizationId: string;
  salonId: string;
  employeeId: string;
  serviceId: string;
  clientId: string | null;
  guestFirstName: string | null;
  guestLastName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  notes: string | null;
  employee: { id: string; firstName: string; lastName: string; color: string | null };
  service: { id: string; name: string; durationMinutes: number; priceCents: number };
};

export type AppointmentModificationView = {
  id: string;
  appointmentId: string;
  modifiedById: string | null;
  modificationType: AppointmentModificationType;
  previousStartAt: Date | null;
  previousEndAt: Date | null;
  previousStatus: AppointmentStatus | null;
  note: string | null;
  createdAt: Date;
};

export type AppointmentDetailView = AppointmentListView & {
  modifications: AppointmentModificationView[];
};

export type AppointmentFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
} | null;

export type CancelFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
} | null;

export type StatusFormState = {
  success?: boolean;
  message?: string;
} | null;

export type AppointmentFilters = {
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  status?: AppointmentStatus;
};

export type EmployeeBasicView = {
  id: string;
  firstName: string;
  lastName: string;
  color: string | null;
};

export type ServiceBasicView = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};
