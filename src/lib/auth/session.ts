import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/features/auth/session.utils";
import {
  verifyPendingToken,
  PENDING_SESSION_COOKIE,
} from "@/lib/auth/pending-session";
import type { SessionUser } from "@/features/auth/types";
import type { PendingSession } from "@/lib/auth/pending-session";

const COOKIE_NAME = "session";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}

export async function getPendingSession(): Promise<PendingSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyPendingToken(token);
}
