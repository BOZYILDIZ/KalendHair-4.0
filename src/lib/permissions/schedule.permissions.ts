import type { SessionUser } from "@/features/auth/types";
import { canAccessTenant } from "./tenant";

export function canManageSchedule(
  user: SessionUser,
  organizationId: string,
): boolean {
  return canAccessTenant(user, organizationId);
}
