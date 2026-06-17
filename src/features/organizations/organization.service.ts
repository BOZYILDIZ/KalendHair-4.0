import { prisma } from "@/lib/db/prisma";
import type { OrganizationView } from "./types";
import type { UpdateOrganizationInput } from "./organization.schema";

export async function getOrganization(
  organizationId: string,
): Promise<OrganizationView | null> {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateOrganization(
  organizationId: string,
  data: UpdateOrganizationInput,
): Promise<OrganizationView> {
  return prisma.organization.update({
    where: { id: organizationId },
    data: { name: data.name },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
    },
  });
}
