import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { getConnectionString, getSslConfig } from "./connection";

/**
 * Client Drizzle unique.
 *
 * Le pool est mémorisé sur globalThis en développement (rechargement à chaud)
 * ET en production : sur une plateforme serverless comme Vercel, une même
 * instance sert plusieurs requêtes successives, et recréer un pool à chaque
 * invocation épuiserait rapidement les connexions de la base.
 */
const globalForDb = globalThis as unknown as { __xwePool?: Pool };

const connectionString = getConnectionString();

/**
 * En serverless, chaque instance ne traite qu'une requête à la fois : un pool
 * étroit suffit et protège la base, qui plafonne vite en nombre de connexions.
 * Neon fournit une URL « pooler » qu'il est recommandé d'utiliser.
 */
const isServerless = Boolean(process.env.VERCEL);

export const pool =
  globalForDb.__xwePool ??
  new Pool({
    connectionString,
    max: isServerless ? 1 : 10,
    ssl: getSslConfig(connectionString),
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: isServerless ? 10_000 : 30_000,
  });

globalForDb.__xwePool = pool;

export const db = drizzle(pool, { schema });
export { schema };
