import { requireSession } from "@/lib/auth/session";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession();
  return <>{children}</>;
}
