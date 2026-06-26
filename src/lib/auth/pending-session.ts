import { SignJWT, jwtVerify } from "jose";

const AUDIENCE = "pending-onboarding";
const EXPIRATION = "24h";
const COOKIE_NAME = "pending_session";

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET manquant");
  return new TextEncoder().encode(s);
}

export type PendingSession = { id: string };

export async function signPendingToken(proUserId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(proUserId)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(getSecret());
}

export async function verifyPendingToken(
  token: string,
): Promise<PendingSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      audience: AUDIENCE,
    });
    if (typeof payload.sub !== "string") return null;
    return { id: payload.sub };
  } catch {
    return null;
  }
}

export { COOKIE_NAME as PENDING_SESSION_COOKIE };
