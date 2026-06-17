import { prisma } from "@/lib/db/prisma";
import type { EmployeeView, EmployeeWithServices } from "./types";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "./employee.schema";

const EMPLOYEE_SELECT = {
  id: true,
  organizationId: true,
  salonId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  color: true,
  photoUrl: true,
  isActive: true,
  createdAt: true,
} as const;

export async function getEmployees(
  salonId: string,
  organizationId: string,
): Promise<EmployeeView[]> {
  return prisma.employee.findMany({
    where: { salonId, organizationId },
    select: EMPLOYEE_SELECT,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export async function getEmployee(
  employeeId: string,
  organizationId: string,
): Promise<EmployeeWithServices | null> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId },
    select: {
      ...EMPLOYEE_SELECT,
      employeeServices: { select: { serviceId: true } },
    },
  });

  if (!employee) return null;

  const { employeeServices, ...rest } = employee;
  return {
    ...rest,
    serviceIds: employeeServices.map((es) => es.serviceId),
  };
}

export async function findPotentialDuplicate(
  salonId: string,
  firstName: string,
  lastName: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await prisma.employee.findFirst({
    where: {
      salonId,
      isActive: true,
      firstName: { equals: firstName, mode: "insensitive" },
      lastName: { equals: lastName, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return existing !== null;
}

export async function createEmployee(
  salonId: string,
  organizationId: string,
  data: CreateEmployeeInput,
): Promise<EmployeeView> {
  return prisma.employee.create({
    data: {
      salonId,
      organizationId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      color: data.color || null,
    },
    select: EMPLOYEE_SELECT,
  });
}

export async function updateEmployee(
  employeeId: string,
  organizationId: string,
  data: UpdateEmployeeInput,
): Promise<EmployeeView> {
  return prisma.employee.update({
    where: { id: employeeId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      color: data.color || null,
    },
    select: EMPLOYEE_SELECT,
  });
}

export async function deactivateEmployee(
  employeeId: string,
  organizationId: string,
): Promise<void> {
  await prisma.employee.updateMany({
    where: { id: employeeId, organizationId },
    data: { isActive: false },
  });
}

export async function reactivateEmployee(
  employeeId: string,
  organizationId: string,
): Promise<void> {
  await prisma.employee.updateMany({
    where: { id: employeeId, organizationId },
    data: { isActive: true },
  });
}
