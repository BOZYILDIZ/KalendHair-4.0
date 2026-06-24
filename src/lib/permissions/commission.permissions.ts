import type { SessionUser } from "@/features/auth/types";
import { canAccessTenant, isSameTenant } from "./tenant";

export function canManageCommissionRules(
  user: SessionUser,
  organizationId: string,
): boolean {
  return canAccessTenant(user, organizationId);
}

export function canViewCommissions(
  user: SessionUser,
  organizationId: string,
): boolean {
  return (
    isSameTenant(user, organizationId) &&
    (user.role === "OWNER" || user.role === "MANAGER")
  );
}

export function canAdjustCommissions(
  user: SessionUser,
  organizationId: string,
): boolean {
  return canAccessTenant(user, organizationId);
}
