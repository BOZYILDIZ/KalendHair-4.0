import type { SessionUser } from "@/features/auth/types";
import { canAccessTenant } from "./tenant";

export function canManagePayment(user: SessionUser, organizationId: string): boolean {
  return canAccessTenant(user, organizationId);
}
