import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/features/auth/session.utils";
import { verifyAdminToken } from "@/features/admin/admin-jwt.utils";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Forward pathname to server components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const next = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  // ── Bloc /admin ──────────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return next();

    const token = request.cookies.get("admin_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const payload = await verifyAdminToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return next();
  }

  // ── Bloc /dashboard ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    // La page de suspension est accessible sans vérification supplémentaire
    if (pathname === "/dashboard/suspended") return next();

    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return next();
  }

  return next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
