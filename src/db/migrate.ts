import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { getConnectionString, getSslConfig } from "./connection";

async function main() {
  const connectionString = getConnectionString();

  // Sans TLS, ce script ne peut pas joindre une base managée (Neon, Supabase…).
  const pool = new Pool({
    connectionString,
    ssl: getSslConfig(connectionString),
    connectionTimeoutMillis: 20_000,
  });

  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  await pool.end();

  const host = new URL(connectionString).hostname;
  console.log(`✓ Migrations appliquées sur ${host}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
