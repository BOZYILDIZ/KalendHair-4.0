import { prisma } from "@/lib/db/prisma";
import type { ServiceView } from "./types";
import type { CreateServiceInput, UpdateServiceInput } from "./service.schema";

const SERVICE_SELECT = {
  id: true,
  organizationId: true,
  salonId: true,
  name: true,
  description: true,
  durationMinutes: true,
  priceCents: true,
  currency: true,
  isActive: true,
  createdAt: true,
} as const;

export async function getServices(
  salonId: string,
  organizationId: string,
): Promise<ServiceView[]> {
  return prisma.service.findMany({
    where: { salonId, organizationId },
    select: SERVICE_SELECT,
    orderBy: { name: "asc" },
  });
}

export async function getService(
  serviceId: string,
  organizationId: string,
): Promise<ServiceView | null> {
  return prisma.service.findFirst({
    where: { id: serviceId, organizationId },
    select: SERVICE_SELECT,
  });
}

export async function createService(
  salonId: string,
  organizationId: string,
  data: CreateServiceInput,
): Promise<ServiceView> {
  return prisma.service.create({
    data: {
      salonId,
      organizationId,
      name: data.name,
      description: data.description || null,
      durationMinutes: data.durationMinutes,
      priceCents: Math.round(data.price * 100),
      currency: "EUR",
    },
    select: SERVICE_SELECT,
  });
}

export async function updateService(
  serviceId: string,
  organizationId: string,
  data: UpdateServiceInput,
): Promise<ServiceView> {
  return prisma.service.update({
    where: { id: serviceId },
    data: {
      name: data.name,
      description: data.description || null,
      durationMinutes: data.durationMinutes,
      priceCents: Math.round(data.price * 100),
    },
    select: SERVICE_SELECT,
  });
}

export async function deactivateService(
  serviceId: string,
  organizationId: string,
): Promise<void> {
  await prisma.service.updateMany({
    where: { id: serviceId, organizationId },
    data: { isActive: false },
  });
}

export async function reactivateService(
  serviceId: string,
  organizationId: string,
): Promise<void> {
  await prisma.service.updateMany({
    where: { id: serviceId, organizationId },
    data: { isActive: true },
  });
}
