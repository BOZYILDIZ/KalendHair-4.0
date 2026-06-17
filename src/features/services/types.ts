export type ServiceView = {
  id: string;
  organizationId: string;
  salonId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
};

export type ServiceFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    description?: string[];
    durationMinutes?: string[];
    price?: string[];
  };
} | null;
