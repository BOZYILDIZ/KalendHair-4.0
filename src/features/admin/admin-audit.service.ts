import type { Prisma, AdminAction } from "@prisma/client";

export async function logAdminAction(
  tx: Prisma.TransactionClient,
  adminId: string,
  action: AdminAction,
  targetOrgId: string | null,
  reason: string,
  details: Prisma.InputJsonObject,
): Promise<void> {
  await tx.adminAuditLog.create({
    data: {
      adminId,
      action,
      targetOrgId,
      reason,
      details,
    },
  });
}
