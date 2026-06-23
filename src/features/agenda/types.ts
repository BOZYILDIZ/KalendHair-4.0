import type { AppointmentStatus } from "@/features/appointments/types";

export type { AppointmentStatus };

export type AgendaView = "day" | "week";

export const SLOT_HEIGHT_REM = 3;

export type GridConfig = {
  startMinute: number;
  endMinute: number;
  slotCount: number;
  slotHeightRem: number;
};

export type AgendaEmployeeView = {
  id: string;
  firstName: string;
  lastName: string;
  color: string | null;
};

export type AgendaBlock = {
  id: string;
  startMinute: number;
  endMinute: number;
  durationMinutes: number;
  status: AppointmentStatus;
  clientName: string;
  serviceName: string;
  employeeId: string;
  employeeFirstName: string;
  employeeColor: string;
};

export type AgendaColumn = {
  employee: AgendaEmployeeView;
  appointments: AgendaBlock[];
  isWorking: boolean;
  scheduleStart: number | null;
  scheduleEnd: number | null;
};

export type AgendaDayData = {
  date: string;
  timezone: string;
  isClosed: boolean;
  closedReason: string | null;
  salonIsOpen: boolean;
  gridConfig: GridConfig;
  columns: AgendaColumn[];
  employees: AgendaEmployeeView[];
  todayStr: string;
  nowMinute: number;
};

export type AgendaWeekDayData = {
  date: string;
  label: string;
  isClosed: boolean;
  closedReason: string | null;
  salonIsOpen: boolean;
  appointments: AgendaBlock[];
};

export type AgendaWeekData = {
  weekStart: string;
  weekEnd: string;
  timezone: string;
  gridConfig: GridConfig;
  days: AgendaWeekDayData[];
  employees: AgendaEmployeeView[];
  todayStr: string;
};
