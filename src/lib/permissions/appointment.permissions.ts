import type { SessionUser } from "@/features/auth/types";
import { canAccessTenant } from "./tenant";

export function canManageAppointment(user: SessionUser, organizationId: string): boolean {
  return canAccessTenant(user, organizationId);
}
