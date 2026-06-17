import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "./types";

const EXPIRATION = "24h";

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET manquant");
  return new TextEncoder().encode(s);
}

export async function signToken(payload: SessionUser): Promise<string> {
  return new SignJWT({
    organizationId: payload.organizationId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(getSecret());
}

export async function verifyToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { sub, organizationId, role } = payload;

    if (
      typeof sub !== "string" ||
      typeof organizationId !== "string" ||
      typeof role !== "string"
    ) {
      return null;
    }

    return {
      id: sub,
      organizationId,
      role: role as SessionUser["role"],
    };
  } catch {
    return null;
  }
}
