export type SalonView = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
};

export type SalonFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    description?: string[];
    phone?: string[];
    email?: string[];
    address?: string[];
    city?: string[];
    postalCode?: string[];
    timezone?: string[];
  };
} | null;
