"use client";

import { useSyncExternalStore } from "react";
import { endImpersonationAction } from "@/app/(dashboard)/dashboard/impersonation/actions";

function readCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

function useCookie(name: string): string | null {
  return useSyncExternalStore(
    () => () => {},
    () => readCookie(name),
    () => null,
  );
}

export function ImpersonationBanner() {
  const orgId = useCookie("impersonation_org_id");
  const logId = useCookie("impersonation_log_id");

  if (!orgId || !logId) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-red-600 px-6 py-2 text-white">
      <div className="flex items-center gap-3">
        <span className="text-lg">⚠️</span>
        <span className="text-sm font-semibold">
          MODE IMPERSONATION — Vous êtes connecté en tant que ce salon
        </span>
      </div>
      <form action={endImpersonationAction}>
        <input type="hidden" name="orgId" value={orgId} />
        <input type="hidden" name="impersonationLogId" value={logId} />
        <button
          type="submit"
          className="rounded bg-white px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Quitter l&#39;impersonation
        </button>
      </form>
    </div>
  );
}
