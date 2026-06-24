import { isFeatureEnabled } from "@/features/billing/billing.service";

export async function canUseInventory(organizationId: string): Promise<boolean> {
  return isFeatureEnabled(organizationId, "inventory");
}

export async function canUsePayments(organizationId: string): Promise<boolean> {
  return isFeatureEnabled(organizationId, "payments");
}

export async function canUseSuppliers(organizationId: string): Promise<boolean> {
  return isFeatureEnabled(organizationId, "suppliers");
}

export async function canUseDashboard(organizationId: string): Promise<boolean> {
  return isFeatureEnabled(organizationId, "kpi");
}
