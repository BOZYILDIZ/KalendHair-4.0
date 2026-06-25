import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
