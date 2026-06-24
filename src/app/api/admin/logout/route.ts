import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/features/admin/admin-auth.service";

export async function POST(request: NextRequest) {
  await clearAdminSessionCookie();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
