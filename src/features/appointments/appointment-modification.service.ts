import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type {
  AppointmentModificationView,
  AppointmentModificationType,
  AppointmentStatus,
} from "./types";

type TxClient = Prisma.TransactionClient;

type LogData = {
  type: AppointmentModificationType;
  modifiedById?: string | null;
  previousStartAt?: Date | null;
  previousEndAt?: Date | null;
  previousStatus?: AppointmentStatus | null;
  note?: string | null;
};

export async function logModification(
  tx: TxClient,
  appointmentId: string,
  data: LogData,
): Promise<void> {
  await tx.appointmentModification.create({
    data: {
      appointmentId,
      modifiedById:     data.modifiedById    ?? null,
      modificationType: data.type            as never,
      previousStartAt:  data.previousStartAt ?? null,
      previousEndAt:    data.previousEndAt   ?? null,
      previousStatus:   data.previousStatus  as never ?? null,
      note:             data.note            ?? null,
    },
  });
}

export async function getModifications(
  appointmentId: string,
  organizationId: string,
): Promise<AppointmentModificationView[]> {
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, organizationId },
    select: { id: true },
  });
  if (!appt) return [];

  const rows = await prisma.appointmentModification.findMany({
    where: { appointmentId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id:               r.id,
    appointmentId:    r.appointmentId,
    modifiedById:     r.modifiedById,
    modificationType: r.modificationType as AppointmentModificationType,
    previousStartAt:  r.previousStartAt,
    previousEndAt:    r.previousEndAt,
    previousStatus:   r.previousStatus as AppointmentStatus | null,
    note:             r.note,
    createdAt:        r.createdAt,
  }));
}
