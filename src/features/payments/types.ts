export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";
export type PaymentStatus = "COMPLETED" | "CANCELLED";
export type AppointmentPaymentState = "unpaid" | "partial" | "paid" | "overpaid";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH:     "Espèces",
  CARD:     "CB",
  TRANSFER: "Virement",
  OTHER:    "Autre",
};

// Options proposées dans le formulaire — OTHER exclu intentionnellement (Sprint 14)
export const FORM_PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH",     label: "Espèces" },
  { value: "CARD",     label: "CB"      },
  { value: "TRANSFER", label: "Virement" },
];

export type PaymentLineView = {
  id:             string;
  label:          string;
  unitPriceCents: number;
  quantity:       number;
  totalCents:     number; // unitPriceCents * quantity, calculé côté service
  serviceId:      string | null;
};

export type PaymentView = {
  id:                 string;
  organizationId:     string;
  salonId:            string;
  appointmentId:      string | null;
  clientId:           string | null;
  guestName:          string | null;
  method:             PaymentMethod;
  status:             PaymentStatus;
  amountCents:        number;
  paidAt:             Date;
  receiptNumber:      string | null;
  notes:              string | null;
  createdByProUserId: string | null;
  isActive:           boolean;
  createdAt:          Date;
  lines:              PaymentLineView[];
  clientName:         string | null; // firstName + lastName ou guestName
  appointmentLabel:   string | null; // nom du service ou null
};

export type PaymentSummary = {
  totalPaidCents: number;
  expectedCents:  number;
  remainingCents: number;
  state:          AppointmentPaymentState;
  payments:       PaymentView[];
};

export type PaymentListItem = {
  id:               string;
  appointmentId:    string | null;
  clientName:       string | null;
  appointmentLabel: string | null;
  method:           PaymentMethod;
  status:           PaymentStatus;
  amountCents:      number;
  paidAt:           Date;
  receiptNumber:    string | null;
  isActive:         boolean;
};

export type PaymentsPage = {
  items:      PaymentListItem[];
  total:      number;
  totalPages: number;
  page:       number;
  totalAmountCents: number; // somme COMPLETED de la période filtrée
};

export type PaymentFilters = {
  method?: PaymentMethod | "ALL";
  status?: PaymentStatus | "ALL";
  from?:   string; // YYYY-MM-DD
  to?:     string; // YYYY-MM-DD
  page?:   number;
};

// Input — totalCents absent intentionnellement (calculé côté service)
export type CreatePaymentLineInput = {
  label:          string;
  unitPriceCents: number;
  quantity:       number;
  serviceId?:     string;
};

export type CreateAppointmentPaymentInput = {
  amountCents: number;
  method:      "CASH" | "CARD" | "TRANSFER";
  paidAt:      string; // ISO date string depuis le formulaire
  notes?:      string;
};

export type CreateFreePaymentInput = {
  amountCents:    number;
  method:         "CASH" | "CARD" | "TRANSFER";
  paidAt:         string;
  notes?:         string;
  guestName?:     string;
  clientId?:      string;
  line: CreatePaymentLineInput;
};

export type PaymentFormState = {
  error?:   string;
  success?: boolean;
};
