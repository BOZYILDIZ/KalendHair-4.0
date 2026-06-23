export type Period = "today" | "week" | "month";
export const VALID_PERIODS: readonly Period[] = ["today", "week", "month"];

export type PeriodRange = { start: Date; end: Date };

export type AppointmentCounts = {
  total: number;
  completed: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  noShow: number;
};

export type TopServiceRow = {
  serviceId: string;
  serviceName: string;
  count: number;
  revenueCents: number;
};

export type TopEmployeeRow = {
  employeeId: string;
  firstName: string;
  lastName: string;
  color: string | null;
  count: number;
  revenueCents: number;
  revenueSharePercent: number;
};

export type FillRateResult = {
  bookedMinutes: number;
  availableMinutes: number;
  ratePercent: number | null;
};

export type DashboardKpi = {
  period: Period;
  revenueCents: number;
  counts: AppointmentCounts;
  newClients: number;
  recurringClients: number;
  topServices: TopServiceRow[];
  topEmployees: TopEmployeeRow[];
  fillRate: FillRateResult;
};
