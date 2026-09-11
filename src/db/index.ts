import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Client Drizzle unique. En développement, Next recharge les modules à chaud :
 * on mémorise le pool sur globalThis pour ne pas saturer les connexions.
 */
const globalForDb = globalThis as unknown as { __xwePool?: Pool };

const connectionString =
  process.env.DATABASE_URL ?? "postgres://xwe:xwe@127.0.0.1:5433/xwe";

export const pool =
  globalForDb.__xwePool ??
  new Pool({
    connectionString,
    max: 10,
    ssl: connectionString.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__xwePool = pool;

export const db = drizzle(pool, { schema });
export { schema };
