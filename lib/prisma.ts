import { PrismaClient } from "@prisma/client";

/**
 * Client Prisma partagé.
 *
 * Le client est mémorisé sur globalThis en développement (Next recharge les
 * modules à chaud) ET en production. Sur une plateforme serverless comme
 * Vercel, une même instance sert plusieurs requêtes successives : recréer un
 * client à chaque invocation ouvrirait un nouveau jeu de connexions à chaque
 * fois et saturerait rapidement la base — Neon plafonne vite.
 *
 * Rappel de déploiement : sur Vercel, utiliser l'URL « pooler » fournie par
 * Neon pour DATABASE_URL, et l'URL directe pour les migrations.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // Échouer tôt et clairement : sans cette vérification, une variable oubliée
  // se manifeste par une exception opaque au premier chargement de page.
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL est absente. Définis-la dans les variables d'environnement " +
        "du serveur (sur Vercel : Settings → Environment Variables), puis redéploie.",
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;
