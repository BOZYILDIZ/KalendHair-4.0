import type { SessionUser } from "@/features/auth/types";
import { canAccessTenant } from "./tenant";

export function canManageClient(user: SessionUser, organizationId: string): boolean {
  return canAccessTenant(user, organizationId);
}
