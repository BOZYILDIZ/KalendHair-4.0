import type { SessionUser } from "@/features/auth/types";
import { isSameTenant } from "./tenant";

export function canManagePurchaseOrders(user: SessionUser, organizationId: string): boolean {
  return isSameTenant(user, organizationId) && (user.role === "OWNER" || user.role === "MANAGER");
}
