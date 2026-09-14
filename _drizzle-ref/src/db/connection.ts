/**
 * Fabrique de connexion PostgreSQL, partagée par l'application et les scripts.
 *
 * Volontairement sans "server-only" : les scripts de migration et d'amorçage
 * en ont besoin, et ce module ne contient aucun secret — seulement la lecture
 * d'une variable d'environnement.
 */

/**
 * Lit DATABASE_URL en échouant immédiatement si elle manque.
 *
 * L'ancienne version retombait en silence sur une base locale, ce qui
 * transformait une variable oubliée en production en « exception côté
 * serveur » illisible. Mieux vaut un message qui nomme le problème.
 */
export function getConnectionString(): string {
  const url = process.env.DATABASE_URL;

  if (!url || url.trim() === "") {
    // En développement uniquement, la base locale reste un repli pratique.
    if (process.env.NODE_ENV !== "production") {
      return "postgres://xwe:xwe@127.0.0.1:5433/xwe";
    }
    throw new Error(
      "DATABASE_URL est absente. Définis-la dans les variables d'environnement " +
        "du serveur (sur Vercel : Settings → Environment Variables), puis redéploie.",
    );
  }

  return url;
}

/**
 * Détermine la configuration TLS.
 *
 * Les bases managées (Neon, Supabase, Railway, RDS…) imposent TLS, mais leur
 * URL ne porte pas toujours `sslmode=require`. Se fier à cette seule chaîne
 * faisait échouer la connexion. On active donc TLS dès que l'hôte n'est pas
 * local, ce qui couvre tous les cas d'hébergement distant.
 */
export function getSslConfig(connectionString: string) {
  if (/sslmode=disable/.test(connectionString)) return undefined;

  let host = "";
  try {
    host = new URL(connectionString).hostname;
  } catch {
    // URL non standard : on reste prudent et on active TLS.
    return { rejectUnauthorized: false };
  }

  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local");

  return isLocal ? undefined : { rejectUnauthorized: false };
}
