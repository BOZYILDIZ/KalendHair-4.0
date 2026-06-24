import type { SessionUser } from "@/features/auth/types";
import { canAccessTenant, isSameTenant } from "./tenant";

export function canManageInventory(user: SessionUser, organizationId: string): boolean {
  return canAccessTenant(user, organizationId);
}

export function canAdjustStock(user: SessionUser, organizationId: string): boolean {
  return (
    isSameTenant(user, organizationId) &&
    (user.role === "OWNER" || user.role === "MANAGER")
  );
}
