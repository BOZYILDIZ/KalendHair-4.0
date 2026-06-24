"use server";

import { cookies } from "next/headers";
import { signAdminToken, verifyAdminToken } from "./admin-jwt.utils";
import type { AdminPayload } from "./types";

const COOKIE_NAME = "admin_session";

export { verifyAdminToken };

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function setAdminSessionCookie(adminId: string): Promise<void> {
  const token = await signAdminToken(adminId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
