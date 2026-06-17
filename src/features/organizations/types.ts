export type OrganizationView = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
};

export type OrganizationFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
  };
} | null;
