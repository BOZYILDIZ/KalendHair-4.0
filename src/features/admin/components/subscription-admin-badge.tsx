import type { OrgSubscriptionStatus, SubscriptionPlanCode } from "@prisma/client";

const PLAN_COLORS: Record<SubscriptionPlanCode, string> = {
  ESSENTIAL: "bg-gray-100 text-gray-700",
  PRO: "bg-blue-100 text-blue-700",
  BUSINESS: "bg-purple-100 text-purple-700",
};

const STATUS_COLORS: Record<OrgSubscriptionStatus, string> = {
  TRIAL: "bg-orange-100 text-orange-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-red-100 text-red-700",
  CANCELED: "bg-gray-100 text-gray-500",
};

export function SubscriptionAdminBadge({
  planCode,
  status,
  isFree,
}: {
  planCode: SubscriptionPlanCode;
  status: OrgSubscriptionStatus;
  isFree: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_COLORS[planCode]}`}
      >
        {planCode}
      </span>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
      >
        {status}
      </span>
      {isFree && (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          GRATUIT
        </span>
      )}
    </div>
  );
}
