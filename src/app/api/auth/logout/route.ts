import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PENDING_SESSION_COOKIE } from "@/lib/auth/pending-session";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete(PENDING_SESSION_COOKIE);

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
