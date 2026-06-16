import { PrismaClient } from "@prisma/client";

/**
 * Client Prisma en singleton.
 *
 * En développement, Next.js recharge fréquemment les modules ; sans ce singleton,
 * chaque rechargement créerait une nouvelle connexion. On réutilise donc l'instance
 * stockée sur l'objet global.
 *
 * Sprint 1 : aucun modèle métier n'est encore défini (voir prisma/schema.prisma).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
