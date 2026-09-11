/**
 * Parcours Business Plan complet.
 *
 * Le Prompt 2 demande un parcours qui couvre réellement toutes les sections
 * d'un business plan. On complète donc les missions existantes plutôt que de
 * les remplacer : les réponses déjà enregistrées restent valables.
 *
 *   npm run db:seed:bp
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import type { MissionField } from "./schema";

interface MissionSeed {
  slug: string;
  title: string;
  objective: string;
  explanation: string;
  instructions: string[];
  resultLabel: string;
  estimatedMinutes: number;
  aiAssist: boolean;
  position: number;
  fields: MissionField[];
}

/**
 * Les missions 5 à 8 complètent le parcours : offre et prix, organisation,
 * prévisions financières, risques. La mission d'assemblage est repoussée en
 * fin de parcours pour rester le point d'aboutissement.
 */
const MISSIONS: MissionSeed[] = [
  {
    slug: "bp-offre-et-prix",
    title: "Construire ton offre et fixer tes prix",
    objective: "Décrire précisément ce que tu vends et à quel prix.",
    explanation:
      "Un business plan tient debout quand l'offre est nette. Ici, tu passes de « je veux aider les gens » à « je vends ceci, à ce prix, à cette personne ». Les montants que tu inscris sont les tiens : ne reprends pas un chiffre lu ailleurs sans l'avoir vérifié pour ton propre cas.",
    instructions: [
      "Liste ce que tu vends réellement : produit, service, ou les deux.",
      "Pour chaque offre, indique un prix et explique comment tu y arrives.",
      "Vérifie que ton prix couvre tes coûts et te laisse une marge.",
    ],
    resultLabel: "Offre et grille tarifaire",
    estimatedMinutes: 30,
    aiAssist: true,
    position: 3,
    fields: [
      {
        key: "offre_principale",
        type: "long_text",
        label: "Décris ton offre principale",
        help: "Ce que le client reçoit concrètement, en termes simples.",
        required: true,
        placeholder: "Le client reçoit…",
      },
      {
        key: "prix_principal",
        type: "number",
        label: "Prix de cette offre (FCFA)",
        help: "Ton prix, pas une moyenne du marché.",
        required: true,
        min: 0,
      },
      {
        key: "justification_prix",
        type: "long_text",
        label: "Comment justifies-tu ce prix ?",
        help: "Coûts, temps passé, valeur perçue, prix pratiqués autour de toi.",
        required: true,
      },
      {
        key: "offres_secondaires",
        type: "long_text",
        label: "Autres offres envisagées",
        help: "Facultatif : versions plus simples ou plus complètes.",
        required: false,
      },
      {
        key: "cout_unitaire",
        type: "number",
        label: "Ce que te coûte une vente (FCFA)",
        help: "Matières, transport, commission, temps facturé. Une estimation honnête suffit.",
        required: true,
        min: 0,
      },
      {
        key: "modele_prix",
        type: "single_choice",
        label: "Comment factures-tu ?",
        options: [
          "Paiement unique",
          "Abonnement mensuel",
          "À la commande",
          "Commission sur les ventes",
          "Mixte",
        ],
        required: true,
      },
    ],
  },
  {
    slug: "bp-organisation",
    title: "Organiser ton activité",
    objective: "Définir qui fait quoi, avec quels moyens.",
    explanation:
      "Un projet ne repose jamais uniquement sur une idée : il repose sur des personnes et des moyens. Cette mission rend visible ce dont tu as besoin pour fonctionner, et ce qui te manque encore.",
    instructions: [
      "Indique qui porte le projet aujourd'hui.",
      "Liste les compétences déjà présentes et celles qui manquent.",
      "Note les moyens matériels indispensables au démarrage.",
    ],
    resultLabel: "Organisation et moyens",
    estimatedMinutes: 25,
    aiAssist: true,
    position: 4,
    fields: [
      {
        key: "porteurs",
        type: "long_text",
        label: "Qui porte le projet ?",
        help: "Toi seul, une équipe, des associés : précise le rôle de chacun.",
        required: true,
      },
      {
        key: "competences_presentes",
        type: "long_text",
        label: "Compétences déjà réunies",
        required: true,
      },
      {
        key: "competences_manquantes",
        type: "long_text",
        label: "Compétences qui manquent",
        help: "Reconnaître un manque est un signe de sérieux, pas de faiblesse.",
        required: true,
      },
      {
        key: "moyens_materiels",
        type: "long_text",
        label: "Moyens matériels nécessaires",
        help: "Local, matériel, logiciels, stock de départ.",
        required: true,
      },
      {
        key: "statut_juridique",
        type: "single_choice",
        label: "Statut envisagé",
        options: [
          "Pas encore décidé",
          "Entreprise individuelle",
          "Société (SARL, SA…)",
          "Association",
          "Coopérative",
        ],
        required: true,
      },
      {
        key: "date_demarrage",
        type: "date",
        label: "Date de démarrage visée",
        required: false,
      },
    ],
  },
  {
    slug: "bp-previsions-financieres",
    title: "Établir tes prévisions financières",
    objective: "Chiffrer ce que ton activité coûte et ce qu'elle peut rapporter.",
    explanation:
      "C'est la section que tout lecteur sérieux regarde en premier. Les chiffres doivent être les tiens et rester prudents : un prévisionnel crédible vaut mieux qu'un prévisionnel flatteur. Tout ce que tu inscris ici est une estimation que tu assumes.",
    instructions: [
      "Estime tes charges de démarrage, puis tes charges mensuelles.",
      "Estime un nombre de ventes réaliste pour les premiers mois.",
      "Indique ce dont tu as besoin comme financement, et d'où il viendrait.",
    ],
    resultLabel: "Prévisions financières",
    estimatedMinutes: 40,
    aiAssist: true,
    position: 5,
    fields: [
      {
        key: "investissement_depart",
        type: "number",
        label: "Investissement de départ (FCFA)",
        help: "Tout ce qu'il faut débourser avant la première vente.",
        required: true,
        min: 0,
      },
      {
        key: "charges_mensuelles",
        type: "number",
        label: "Charges mensuelles (FCFA)",
        help: "Loyer, connexion, transport, salaires, abonnements.",
        required: true,
        min: 0,
      },
      {
        key: "ventes_mois_1_3",
        type: "number",
        label: "Ventes estimées par mois (3 premiers mois)",
        help: "Sois prudent : mieux vaut dépasser une prévision basse.",
        required: true,
        min: 0,
      },
      {
        key: "ventes_mois_4_12",
        type: "number",
        label: "Ventes estimées par mois (mois 4 à 12)",
        required: true,
        min: 0,
      },
      {
        key: "besoin_financement",
        type: "number",
        label: "Financement recherché (FCFA)",
        help: "Zéro si tu autofinances.",
        required: true,
        min: 0,
      },
      {
        key: "sources_financement",
        type: "multi_choice",
        label: "Sources de financement envisagées",
        options: [
          "Fonds propres",
          "Famille et proches",
          "Prêt bancaire",
          "Microfinance",
          "Subvention ou concours",
          "Investisseur",
        ],
        required: true,
      },
      {
        key: "hypotheses",
        type: "long_text",
        label: "Sur quelles hypothèses reposent ces chiffres ?",
        help: "Indispensable : c'est ce qui rend tes estimations vérifiables.",
        required: true,
      },
    ],
  },
  {
    slug: "bp-risques-opportunites",
    title: "Identifier risques et opportunités",
    objective: "Montrer que tu as anticipé ce qui peut mal tourner.",
    explanation:
      "Un porteur de projet qui n'annonce aucun risque inquiète davantage qu'il ne rassure. Nommer les difficultés et prévoir une réponse est un signe de maîtrise.",
    instructions: [
      "Nomme les trois risques les plus sérieux.",
      "Pour chacun, décris ce que tu ferais s'il se réalisait.",
      "Identifie les opportunités sur lesquelles tu peux t'appuyer.",
    ],
    resultLabel: "Risques et opportunités",
    estimatedMinutes: 25,
    aiAssist: true,
    position: 6,
    fields: [
      {
        key: "risque_1",
        type: "long_text",
        label: "Risque principal et ta réponse",
        required: true,
        placeholder: "Risque : … / Ce que je ferais : …",
      },
      {
        key: "risque_2",
        type: "long_text",
        label: "Deuxième risque et ta réponse",
        required: true,
      },
      {
        key: "risque_3",
        type: "long_text",
        label: "Troisième risque et ta réponse",
        required: false,
      },
      {
        key: "opportunites",
        type: "long_text",
        label: "Opportunités à saisir",
        help: "Évolution du marché, partenariat possible, besoin non couvert.",
        required: true,
      },
      {
        key: "niveau_risque",
        type: "single_choice",
        label: "Comment juges-tu le niveau de risque global ?",
        options: ["Faible", "Modéré", "Élevé"],
        required: true,
      },
    ],
  },
  {
    slug: "bp-synthese",
    title: "Rédiger ta synthèse",
    objective: "Résumer ton projet en une page convaincante.",
    explanation:
      "La synthèse se lit en premier et s'écrit en dernier. Un lecteur pressé ne lira souvent qu'elle : elle doit tenir seule, sans le reste du document.",
    instructions: [
      "Résume ton projet en cinq phrases maximum.",
      "Indique ce que tu demandes concrètement au lecteur.",
      "Relis à voix haute : si tu hésites, la phrase est à reprendre.",
    ],
    resultLabel: "Synthèse du projet",
    estimatedMinutes: 20,
    aiAssist: true,
    position: 7,
    fields: [
      {
        key: "pitch",
        type: "long_text",
        label: "Ton projet en cinq phrases",
        required: true,
      },
      {
        key: "demande",
        type: "long_text",
        label: "Que demandes-tu au lecteur ?",
        help: "Un financement, un partenariat, un accompagnement, un avis.",
        required: true,
      },
      {
        key: "atout_principal",
        type: "short_text",
        label: "Ton atout décisif, en une phrase",
        required: true,
      },
    ],
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL ?? "postgres://xwe:xwe@127.0.0.1:5433/xwe";
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  const rows = await db
    .select({ id: schema.pathways.id })
    .from(schema.pathways)
    .where(eq(schema.pathways.slug, "creer-mon-business-plan"))
    .limit(1);

  const pathway = rows[0];
  if (!pathway) {
    console.error("Parcours business plan introuvable — lance d'abord npm run db:seed.");
    process.exit(1);
  }

  console.log("→ Missions complémentaires du business plan");
  for (const mission of MISSIONS) {
    const existing = await db
      .select({ id: schema.missions.id })
      .from(schema.missions)
      .where(eq(schema.missions.slug, mission.slug))
      .limit(1);

    if (existing[0]) {
      await db
        .update(schema.missions)
        .set({ ...mission, pathwayId: pathway.id, updatedAt: new Date() })
        .where(eq(schema.missions.id, existing[0].id));
    } else {
      await db.insert(schema.missions).values({ ...mission, pathwayId: pathway.id });
    }
  }

  /**
   * Renumérotation complète : les missions préexistantes et les nouvelles
   * doivent former une suite sans trou ni doublon, sinon l'ordre affiché
   * dépend du hasard du tri secondaire.
   */
  const ORDER = [
    "bp-cadrer-le-projet",
    "bp-etude-de-marche",
    "bp-modele-economique",
    "bp-offre-et-prix",
    "bp-organisation",
    "bp-previsions-financieres",
    "bp-plan-action",
    "bp-risques-opportunites",
    "bp-synthese",
    "bp-assembler-document",
  ];

  for (const [index, slug] of ORDER.entries()) {
    await db
      .update(schema.missions)
      .set({ position: index })
      .where(eq(schema.missions.slug, slug));
  }

  const all = await db
    .select({ id: schema.missions.id })
    .from(schema.missions)
    .where(eq(schema.missions.pathwayId, pathway.id));

  // Durée et promesse du parcours doivent suivre son contenu réel.
  await db
    .update(schema.pathways)
    .set({
      durationMinutes: 240,
      expectedResult: "Un business plan professionnel complet, prêt à être présenté",
      updatedAt: new Date(),
    })
    .where(eq(schema.pathways.id, pathway.id));

  await pool.end();
  console.log(`\n✓ Parcours business plan : ${all.length} missions.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
