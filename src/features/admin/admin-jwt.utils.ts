import { SignJWT, jwtVerify } from "jose";
import type { AdminPayload } from "./types";

const EXPIRATION = "8h";

function getSecret(): Uint8Array {
  const s = process.env.ADMIN_JWT_SECRET ?? process.env.JWT_SECRET;
  if (!s) throw new Error("ADMIN_JWT_SECRET manquant");
  return new TextEncoder().encode(`admin:${s}`);
}

export async function signAdminToken(adminId: string): Promise<string> {
  return new SignJWT({ role: "SUPER_ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(getSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { sub, role } = payload;
    if (typeof sub !== "string" || role !== "SUPER_ADMIN") return null;
    return { sub, role: "SUPER_ADMIN" };
  } catch {
    return null;
  }
}
