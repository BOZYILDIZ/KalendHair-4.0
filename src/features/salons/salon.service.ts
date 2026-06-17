import { prisma } from "@/lib/db/prisma";
import type { SalonView } from "./types";
import type { UpdateSalonInput } from "./salon.schema";

export async function getSalon(organizationId: string): Promise<SalonView | null> {
  return prisma.salon.findUnique({
    where: { organizationId },
    select: {
      id: true,
      organizationId: true,
      name: true,
      slug: true,
      description: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      postalCode: true,
      timezone: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateSalon(
  organizationId: string,
  data: UpdateSalonInput,
): Promise<SalonView> {
  return prisma.salon.update({
    where: { organizationId },
    data: {
      name: data.name,
      description: data.description || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      postalCode: data.postalCode || null,
      timezone: data.timezone || "Europe/Paris",
    },
    select: {
      id: true,
      organizationId: true,
      name: true,
      slug: true,
      description: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      postalCode: true,
      timezone: true,
      isActive: true,
      createdAt: true,
    },
  });
}
