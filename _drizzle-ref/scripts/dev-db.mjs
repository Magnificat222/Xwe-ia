/**
 * Base PostgreSQL locale pour le développement, sans installation système.
 * Utilise un binaire Postgres embarqué. En production, DATABASE_URL pointe
 * vers un PostgreSQL managé (Neon, Supabase, Railway…) et ce script ne sert pas.
 *
 *   node scripts/dev-db.mjs
 */
import EmbeddedPostgres from "embedded-postgres";

const pg = new EmbeddedPostgres({
  databaseDir: "/tmp/xwe-pgdata",
  user: "xwe",
  password: "xwe",
  port: 5433,
  persistent: true,
});

try {
  await pg.initialise();
} catch {
  // Déjà initialisée.
}

await pg.start();

try {
  await pg.createDatabase("xwe");
} catch {
  // Déjà créée.
}

console.log("PostgreSQL prêt sur postgres://xwe:xwe@127.0.0.1:5433/xwe");

const shutdown = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Garde le processus vivant.
setInterval(() => {}, 1 << 30);
