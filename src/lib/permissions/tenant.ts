import type { SessionUser } from "@/features/auth/types";

export function isSameTenant(user: SessionUser, organizationId: string): boolean {
  return user.organizationId === organizationId;
}

export function isOwner(user: SessionUser): boolean {
  return user.role === "OWNER";
}

export function canAccessTenant(user: SessionUser, organizationId: string): boolean {
  return isOwner(user) && isSameTenant(user, organizationId);
}
