/**
 * Injecte les données commerciales, IA et communautaires du Prompt 2.
 * Idempotent : relancer le script ne duplique rien.
 *
 *   npm run db:seed:commerce
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

/**
 * Prix de lancement, alignés sur la grille tarifaire du produit.
 * Ils ne vivent ici que le temps de l'amorçage : ensuite, l'administration
 * est seule maîtresse des tarifs.
 */
const PRICES: { slug: string; priceXof: number }[] = [
  { slug: "creer-mon-cv-professionnel", priceXof: 1000 },
  { slug: "developper-mes-reseaux-sociaux", priceXof: 1000 },
  { slug: "preparer-ma-soutenance", priceXof: 2000 },
  { slug: "creer-ma-strategie-marketing", priceXof: 2000 },
  { slug: "creer-mon-business-plan", priceXof: 2500 },
];

const PAYMENT_NUMBERS = [
  {
    label: "MTN MoMo — principal",
    number: "+229 01 51 36 76 76",
    holderName: "Xwé IA",
    isPrimary: true,
    position: 0,
  },
  {
    label: "MTN MoMo — secondaire",
    number: "+229 01 43 37 39 57",
    holderName: "Xwé IA",
    isPrimary: false,
    position: 1,
  },
];

const PREMIUM_BENEFITS = [
  {
    label: "Tout le catalogue de parcours",
    description:
      "Les parcours payants comme les parcours Premium, sans achat à l'unité.",
    icon: "Route",
    position: 0,
  },
  {
    label: "Assistance IA élargie",
    description: "Des limites nettement plus hautes sur l'aide à la rédaction et à la structuration.",
    icon: "Sparkles",
    position: 1,
  },
  {
    label: "Génération de documents",
    description: "Transforme tes réponses en livrables professionnels, autant de fois que nécessaire.",
    icon: "FileText",
    position: 2,
  },
  {
    label: "Ressources et prompts Premium",
    description: "La bibliothèque complète, mise à jour régulièrement.",
    icon: "Folder",
    position: 3,
  },
  {
    label: "Suivi avancé de ta progression",
    description: "Historique détaillé, projets sauvegardés et reprise là où tu t'es arrêté.",
    icon: "TrendingUp",
    position: 4,
  },
];

/** Quotas IA par défaut. Modifiables ensuite depuis l'administration. */
const AI_QUOTAS: {
  plan: "free" | "premium";
  feature: schema.AiFeature;
  dailyLimit: number;
  monthlyLimit: number;
}[] = [
  { plan: "free", feature: "mission_assist", dailyLimit: 15, monthlyLimit: 150 },
  { plan: "free", feature: "brainstorm", dailyLimit: 10, monthlyLimit: 100 },
  { plan: "free", feature: "rephrase", dailyLimit: 10, monthlyLimit: 100 },
  { plan: "free", feature: "structure", dailyLimit: 10, monthlyLimit: 100 },
  { plan: "free", feature: "analyze", dailyLimit: 8, monthlyLimit: 80 },
  { plan: "free", feature: "explain", dailyLimit: 15, monthlyLimit: 150 },
  { plan: "free", feature: "document", dailyLimit: 2, monthlyLimit: 10 },
  { plan: "premium", feature: "mission_assist", dailyLimit: 150, monthlyLimit: 3000 },
  { plan: "premium", feature: "brainstorm", dailyLimit: 100, monthlyLimit: 2000 },
  { plan: "premium", feature: "rephrase", dailyLimit: 100, monthlyLimit: 2000 },
  { plan: "premium", feature: "structure", dailyLimit: 100, monthlyLimit: 2000 },
  { plan: "premium", feature: "analyze", dailyLimit: 80, monthlyLimit: 1500 },
  { plan: "premium", feature: "explain", dailyLimit: 150, monthlyLimit: 3000 },
  { plan: "premium", feature: "document", dailyLimit: 30, monthlyLimit: 300 },
];

const BADGES = [
  {
    slug: "premiere-mission",
    label: "Première mission",
    description: "Tu as terminé ta première mission. Le plus dur est fait : commencer.",
    icon: "Zap",
    ruleType: "missions_completed",
    threshold: 1,
    position: 0,
  },
  {
    slug: "dix-missions",
    label: "Dix missions",
    description: "Dix missions bouclées. La régularité paie.",
    icon: "Target",
    ruleType: "missions_completed",
    threshold: 10,
    position: 1,
  },
  {
    slug: "premier-parcours",
    label: "Premier parcours",
    description: "Un parcours mené jusqu'au livrable.",
    icon: "Trophy",
    ruleType: "pathways_completed",
    threshold: 1,
    position: 2,
  },
  {
    slug: "trois-parcours",
    label: "Trois parcours",
    description: "Trois objectifs atteints de bout en bout.",
    icon: "Route",
    ruleType: "pathways_completed",
    threshold: 3,
    position: 3,
  },
  {
    slug: "premier-defi",
    label: "Premier défi",
    description: "Tu t'es lancé dans l'Arène.",
    icon: "Swords",
    ruleType: "challenges_completed",
    threshold: 1,
    position: 4,
  },
  {
    slug: "vingt-defis",
    label: "Vingt défis",
    description: "Vingt défis relevés. L'entraînement devient une habitude.",
    icon: "Trophy",
    ruleType: "challenges_completed",
    threshold: 20,
    position: 5,
  },
  {
    slug: "voix-de-la-communaute",
    label: "Voix de la communauté",
    description: "Cinq contributions utiles dans la Discussion.",
    icon: "Users",
    ruleType: "discussion_posts",
    threshold: 5,
    position: 6,
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL ?? "postgres://xwe:xwe@127.0.0.1:5433/xwe";
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  console.log("→ Prix de lancement");
  for (const price of PRICES) {
    const rows = await db
      .select({ id: schema.pathways.id, priceXof: schema.pathways.priceXof })
      .from(schema.pathways)
      .where(eq(schema.pathways.slug, price.slug))
      .limit(1);

    if (!rows[0]) continue;
    if (rows[0].priceXof === price.priceXof) continue;

    await db
      .update(schema.pathways)
      .set({ accessType: "paid", priceXof: price.priceXof })
      .where(eq(schema.pathways.id, rows[0].id));

    await db.insert(schema.priceHistory).values({
      pathwayId: rows[0].id,
      scope: "pathway",
      oldPriceXof: rows[0].priceXof,
      newPriceXof: price.priceXof,
      reason: "Grille tarifaire de lancement",
    });
  }

  console.log("→ Numéros MoMo");
  for (const number of PAYMENT_NUMBERS) {
    const existing = await db
      .select({ id: schema.paymentNumbers.id })
      .from(schema.paymentNumbers)
      .where(eq(schema.paymentNumbers.number, number.number))
      .limit(1);
    if (existing[0]) continue;
    await db.insert(schema.paymentNumbers).values(number);
  }

  console.log("→ Avantages Premium");
  for (const benefit of PREMIUM_BENEFITS) {
    const existing = await db
      .select({ id: schema.premiumBenefits.id })
      .from(schema.premiumBenefits)
      .where(eq(schema.premiumBenefits.label, benefit.label))
      .limit(1);
    if (existing[0]) continue;
    await db.insert(schema.premiumBenefits).values(benefit);
  }

  console.log("→ Quotas IA");
  for (const quota of AI_QUOTAS) {
    await db
      .insert(schema.aiQuotas)
      .values(quota)
      .onConflictDoNothing({ target: [schema.aiQuotas.plan, schema.aiQuotas.feature] });
  }

  console.log("→ Badges");
  for (const badge of BADGES) {
    await db.insert(schema.badges).values(badge).onConflictDoNothing({
      target: schema.badges.slug,
    });
  }

  await pool.end();
  console.log("\n✓ Données commerciales injectées.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
