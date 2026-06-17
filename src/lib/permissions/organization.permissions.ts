import type { SessionUser } from "@/features/auth/types";
import { canAccessTenant } from "./tenant";

export function canManageOrganization(
  user: SessionUser,
  organizationId: string,
): boolean {
  return canAccessTenant(user, organizationId);
}
