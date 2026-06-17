import type { ProRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  organizationId: string;
  role: ProRole;
};
