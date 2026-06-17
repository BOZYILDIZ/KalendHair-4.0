export type EmployeeView = {
  id: string;
  organizationId: string;
  salonId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  color: string | null;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
};

export type EmployeeWithServices = EmployeeView & {
  serviceIds: string[];
};

export type EmployeePendingData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  color: string;
};

export type EmployeeFormState = {
  success?: boolean;
  message?: string;
  warning?: string;
  requireConfirmation?: boolean;
  pendingData?: EmployeePendingData;
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    phone?: string[];
    color?: string[];
  };
} | null;
