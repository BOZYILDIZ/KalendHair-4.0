import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/features/auth/session.utils";
import { verifyAdminToken } from "@/features/admin/admin-jwt.utils";
import { verifyPendingToken, PENDING_SESSION_COOKIE } from "@/lib/auth/pending-session";

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

  // ── Bloc /inscription ────────────────────────────────────────────────────────
  if (pathname === "/inscription") {
    // Utilisateur déjà authentifié avec organisation → dashboard
    const sessionToken = request.cookies.get("session")?.value;
    if (sessionToken) {
      const session = await verifyToken(sessionToken);
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Utilisateur en cours d'onboarding → onboarding
    const pendingToken = request.cookies.get(PENDING_SESSION_COOKIE)?.value;
    if (pendingToken) {
      const pending = await verifyPendingToken(pendingToken);
      if (pending) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }

    return next();
  }

  // ── Bloc /onboarding ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/onboarding")) {
    // Utilisateur déjà authentifié avec organisation → dashboard
    const sessionToken = request.cookies.get("session")?.value;
    if (sessionToken) {
      const session = await verifyToken(sessionToken);
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Sans pending_session → retour à l'inscription
    const pendingToken = request.cookies.get(PENDING_SESSION_COOKIE)?.value;
    if (!pendingToken) {
      return NextResponse.redirect(new URL("/inscription", request.url));
    }

    const pending = await verifyPendingToken(pendingToken);
    if (!pending) {
      return NextResponse.redirect(new URL("/inscription", request.url));
    }

    return next();
  }

  return next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/inscription", "/onboarding/:path*"],
};
