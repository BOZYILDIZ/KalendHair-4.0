import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "./password.utils";
import type { ProUser } from "@prisma/client";

export async function validateCredentials(
  email: string,
  password: string,
): Promise<ProUser | null> {
  const user = await prisma.proUser.findUnique({ where: { email } });

  if (!user || !user.isActive || user.role !== "OWNER" || !user.passwordHash) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}
