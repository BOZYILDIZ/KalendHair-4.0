// Codex — Sprint 18 : schémas Zod Billing Core
import { z } from "zod";

export const UpgradePlanSchema = z.object({
  organizationId: z.string().min(1),
  planCode:       z.enum(["ESSENTIAL", "PRO", "BUSINESS"]),
  billingCycle:   z.enum(["MONTHLY", "YEARLY"]),
});

export const ChangeBillingCycleSchema = z.object({
  organizationId: z.string().min(1),
  billingCycle:   z.enum(["MONTHLY", "YEARLY"]),
});

export type UpgradePlanData       = z.infer<typeof UpgradePlanSchema>;
export type ChangeBillingCycleData = z.infer<typeof ChangeBillingCycleSchema>;
