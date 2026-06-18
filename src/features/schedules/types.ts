export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY:    "Lundi",
  TUESDAY:   "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY:  "Jeudi",
  FRIDAY:    "Vendredi",
  SATURDAY:  "Samedi",
  SUNDAY:    "Dimanche",
};

// UTC day index (getUTCDay()) → DayOfWeek
export const UTC_DAY_MAP: DayOfWeek[] = [
  "SUNDAY",    // 0
  "MONDAY",    // 1
  "TUESDAY",   // 2
  "WEDNESDAY", // 3
  "THURSDAY",  // 4
  "FRIDAY",    // 5
  "SATURDAY",  // 6
];

export const DEFAULT_SALON_SCHEDULE: Array<{
  dayOfWeek: DayOfWeek;
  startMinute: number;
  endMinute: number;
  isOpen: boolean;
}> = [
  { dayOfWeek: "MONDAY",    startMinute: 540, endMinute: 1080, isOpen: true  },
  { dayOfWeek: "TUESDAY",   startMinute: 540, endMinute: 1080, isOpen: true  },
  { dayOfWeek: "WEDNESDAY", startMinute: 540, endMinute: 1080, isOpen: true  },
  { dayOfWeek: "THURSDAY",  startMinute: 540, endMinute: 1080, isOpen: true  },
  { dayOfWeek: "FRIDAY",    startMinute: 540, endMinute: 1080, isOpen: true  },
  { dayOfWeek: "SATURDAY",  startMinute: 540, endMinute: 1020, isOpen: true  },
  { dayOfWeek: "SUNDAY",    startMinute: 540, endMinute: 1080, isOpen: false },
];

export type SalonScheduleView = {
  id: string;
  salonId: string;
  dayOfWeek: DayOfWeek;
  startMinute: number;
  endMinute: number;
  isOpen: boolean;
};

export type SalonScheduleGridEntry = {
  dayOfWeek: DayOfWeek;
  startMinute: number;
  endMinute: number;
  isOpen: boolean;
};

export type EmployeeScheduleView = {
  id: string;
  employeeId: string;
  dayOfWeek: DayOfWeek;
  startMinute: number;
  endMinute: number;
  isWorking: boolean;
};

export type EmployeeScheduleGridEntry = {
  dayOfWeek: DayOfWeek;
  startMinute: number;
  endMinute: number;
  isWorking: boolean;
};

export type ClosedDayView = {
  id: string;
  salonId: string;
  date: Date;
  reason: string | null;
};

export type AvailabilityResult = {
  available: boolean;
  reason?: string;
};

export type ScheduleFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
} | null;

export type ClosedDayFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    date?: string[];
    reason?: string[];
  };
} | null;
