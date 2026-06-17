import { prisma } from "@/lib/db/prisma";

export async function getEmployeeServiceIds(
  employeeId: string,
  organizationId: string,
): Promise<string[]> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId },
    select: { employeeServices: { select: { serviceId: true } } },
  });
  return employee?.employeeServices.map((es) => es.serviceId) ?? [];
}

export async function syncEmployeeServices(
  employeeId: string,
  organizationId: string,
  serviceIds: string[],
  salonServiceIds: string[],
): Promise<void> {
  const validServiceIds = serviceIds.filter((id) =>
    salonServiceIds.includes(id),
  );

  await prisma.$transaction([
    prisma.employeeService.deleteMany({ where: { employeeId } }),
    prisma.employeeService.createMany({
      data: validServiceIds.map((serviceId) => ({ employeeId, serviceId })),
      skipDuplicates: true,
    }),
  ]);
}
