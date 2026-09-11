import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  const connectionString =
    process.env.DATABASE_URL ?? "postgres://xwe:xwe@127.0.0.1:5433/xwe";
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  await pool.end();
  console.log("✓ Migrations appliquées");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
