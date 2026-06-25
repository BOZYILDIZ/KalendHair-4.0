import { headers } from "next/headers";

export async function getClientIP(): Promise<string> {
  const h = await headers();
  // Vercel injecte x-forwarded-for, fallback x-real-ip, fallback unknown
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return h.get("x-real-ip") ?? "unknown";
}
