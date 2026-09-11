/**
 * Contenu initial de Xwé IA.
 *
 * Ce fichier ne sert QU'AU SEED : une fois injecté, tout est administrable
 * depuis /admin. Aucune page n'importe ce fichier — le contenu vit en base,
 * pour qu'il puisse évoluer sans redéploiement.
 */
import type { MissionField, MissionPrompt } from "@/db/schema";

export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

export type SeedGoal = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  outcome: string;
  category: string;
  featured?: boolean;
  pathways: string[];
};

export type SeedMission = {
  slug: string;
  title: string;
  objective: string;
  explanation: string;
  instructions: string[];
  fields: MissionField[];
  prompts?: MissionPrompt[];
  tips?: string[];
  pitfalls?: string[];
  checklist?: string[];
  resultLabel: string;
  estimatedMinutes: number;
  aiAssist?: boolean;
  tools?: string[];
};

export type SeedPathway = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  level: "debutant" | "intermediaire" | "avance";
  accessType: "free" | "paid" | "premium";
  priceXof: number;
  expectedResult: string;
  accentColor: string;
  missions: SeedMission[];
};

/* ------------------------------------------------------------------ */

export const categories: SeedCategory[] = [
  { slug: "business", name: "Business", description: "Plans, offres, modèles économiques", icon: "Briefcase", color: "braise" },
  { slug: "marketing", name: "Marketing", description: "Acquisition, contenu, réseaux sociaux", icon: "Megaphone", color: "or" },
  { slug: "etudes", name: "Études", description: "Soutenances, mémoires, révisions", icon: "GraduationCap", color: "feuillage" },
  { slug: "carriere", name: "Carrière", description: "CV, entretiens, positionnement", icon: "BriefcaseBusiness", color: "or" },
  { slug: "creation", name: "Création", description: "Identité visuelle, contenu créatif", icon: "Palette", color: "braise" },
  { slug: "productivite", name: "Productivité", description: "Organisation, routines, priorisation", icon: "CheckCircle2", color: "feuillage" },
  { slug: "ia", name: "Intelligence artificielle", description: "Prompt engineering, outils, usages", icon: "Sparkles", color: "or" },
  { slug: "projet", name: "Projet", description: "Structurer, planifier, piloter", icon: "KanbanSquare", color: "feuillage" },
];

/* ------------------------------------------------------------------
   Parcours — chaque mission produit quelque chose (champs typés).
   ------------------------------------------------------------------ */

export const pathways: SeedPathway[] = [
  {
    slug: "creer-mon-business-plan",
    title: "Créer mon business plan",
    summary: "Du concept flou jusqu'à un document structuré, chiffré et présentable.",
    description:
      "Ce parcours te fait passer d'une idée en tête à un business plan complet que tu peux montrer à une banque, un partenaire ou un incubateur. Chaque mission te fait écrire une partie du document : à la fin, il est assemblé pour toi.",
    category: "business",
    level: "debutant",
    accessType: "paid",
    priceXof: 2500,
    expectedResult: "Un business plan complet en 6 sections, téléchargeable.",
    accentColor: "braise",
    missions: [
      {
        slug: "bp-cadrer-le-projet",
        title: "Cadrer ton projet en une phrase",
        objective: "Formuler clairement ce que tu proposes, à qui, et pourquoi c'est utile.",
        explanation:
          "Un business plan qui commence flou reste flou jusqu'à la fin. Avant de parler chiffres, il faut pouvoir énoncer ton projet en une phrase qu'un inconnu comprend du premier coup.",
        instructions: [
          "Décris ton projet comme si tu l'expliquais à un ami, sans jargon.",
          "Identifie précisément qui a le problème que tu résous.",
          "Formule la phrase de synthèse : « J'aide [cible] à [résultat] grâce à [solution] ».",
        ],
        fields: [
          {
            key: "idee",
            type: "long_text",
            label: "Décris ton projet en quelques lignes",
            placeholder: "Je veux lancer…",
            required: true,
            help: "Écris naturellement, on structurera après.",
          },
          {
            key: "cible",
            type: "short_text",
            label: "Qui est ta cible principale ?",
            placeholder: "Ex : commerçantes de Cotonou qui vendent en ligne",
            required: true,
          },
          {
            key: "probleme",
            type: "long_text",
            label: "Quel problème précis résous-tu ?",
            required: true,
          },
          {
            key: "phrase",
            type: "short_text",
            label: "Ta phrase de synthèse",
            placeholder: "J'aide … à … grâce à …",
            required: true,
          },
          {
            key: "stade",
            type: "single_choice",
            label: "Où en es-tu aujourd'hui ?",
            options: ["Simple idée", "Idée testée auprès de proches", "Premiers clients", "Activité déjà lancée"],
            required: true,
          },
        ],
        prompts: [
          {
            title: "Clarifier ma proposition de valeur",
            body: "Tu es consultant en stratégie. Voici mon projet : [colle ta description]. Reformule-le en une phrase claire du type « J'aide X à Y grâce à Z », puis propose 3 variantes plus percutantes.",
          },
        ],
        tips: [
          "Si tu as besoin de deux phrases, c'est que le projet n'est pas encore assez cadré.",
          "Teste ta phrase sur quelqu'un qui ne connaît pas ton secteur.",
        ],
        pitfalls: ["Décrire la solution avant le problème.", "Viser « tout le monde » comme cible."],
        checklist: ["Phrase de synthèse écrite", "Cible identifiée", "Problème formulé"],
        resultLabel: "Cadrage du projet",
        estimatedMinutes: 25,
        aiAssist: true,
        tools: ["chatgpt", "claude"],
      },
      {
        slug: "bp-etude-de-marche",
        title: "Comprendre ton marché",
        objective: "Savoir qui sont tes concurrents et quelle place tu peux prendre.",
        explanation:
          "Tu n'as pas besoin d'une étude de marché de 50 pages. Tu as besoin de savoir qui fait déjà ce que tu veux faire, comment, à quel prix, et ce que tu feras différemment.",
        instructions: [
          "Liste 3 acteurs qui répondent déjà au besoin de ta cible.",
          "Note pour chacun leur prix approximatif et leur point faible.",
          "Formule ce qui te différencie concrètement.",
        ],
        fields: [
          { key: "concurrent1", type: "short_text", label: "Concurrent 1 — nom et positionnement", required: true },
          { key: "concurrent2", type: "short_text", label: "Concurrent 2 — nom et positionnement" },
          { key: "concurrent3", type: "short_text", label: "Concurrent 3 — nom et positionnement" },
          { key: "faiblesses", type: "long_text", label: "Que font-ils mal, ou pas du tout ?", required: true },
          { key: "differenciation", type: "long_text", label: "Ta différence en 2 ou 3 points", required: true },
          {
            key: "taille_marche",
            type: "single_choice",
            label: "Ton marché initial",
            options: ["Un quartier / une ville", "Une région", "Un pays", "International"],
            required: true,
          },
        ],
        prompts: [
          {
            title: "Synthèse concurrentielle",
            body: "Tu es analyste marché. Pour le secteur [secteur] dans la zone [zone], liste 5 tendances clés, 3 concurrents directs avec leur positionnement, et 2 opportunités sous-exploitées.",
          },
        ],
        tips: ["Regarde aussi les solutions « bricolées » : Excel, WhatsApp, le cahier."],
        pitfalls: ["Affirmer qu'il n'y a pas de concurrent — il y en a toujours un."],
        checklist: ["3 concurrents identifiés", "Différenciation écrite"],
        resultLabel: "Analyse du marché",
        estimatedMinutes: 35,
        aiAssist: true,
        tools: ["perplexity", "chatgpt"],
      },
      {
        slug: "bp-modele-economique",
        title: "Définir ton modèle économique",
        objective: "Savoir comment l'argent entre, et combien il faut pour tenir.",
        explanation:
          "Un projet sans modèle économique est un loisir. Cette mission te fait poser tes sources de revenus, tes coûts, et ton point d'équilibre.",
        instructions: [
          "Liste tes sources de revenus, de la plus probable à la moins sûre.",
          "Chiffre ton prix de vente et ton coût de revient.",
          "Estime tes charges fixes mensuelles.",
        ],
        fields: [
          { key: "revenus", type: "long_text", label: "Tes sources de revenus", required: true },
          { key: "prix", type: "number", label: "Prix de vente moyen (FCFA)", min: 0, required: true },
          { key: "cout", type: "number", label: "Coût de revient unitaire (FCFA)", min: 0, required: true },
          { key: "charges", type: "number", label: "Charges fixes mensuelles (FCFA)", min: 0, required: true },
          { key: "objectif_mensuel", type: "number", label: "Objectif de ventes par mois", min: 0 },
        ],
        tips: ["Si tu ne connais pas ton coût de revient, tu ne connais pas ta marge."],
        pitfalls: ["Oublier son propre salaire dans les charges."],
        checklist: ["Prix fixé", "Coûts chiffrés", "Point d'équilibre estimé"],
        resultLabel: "Modèle économique",
        estimatedMinutes: 40,
        tools: ["chatgpt"],
      },
      {
        slug: "bp-plan-action",
        title: "Construire ton plan d'action",
        objective: "Transformer le plan en calendrier concret sur 90 jours.",
        explanation:
          "Un business plan se termine par ce que tu fais lundi matin. Cette mission fixe tes trois prochains jalons et leurs dates.",
        instructions: [
          "Définis 3 jalons atteignables dans les 90 jours.",
          "Associe une date à chacun.",
          "Identifie ce qui pourrait te bloquer.",
        ],
        fields: [
          { key: "jalon1", type: "short_text", label: "Jalon 1", required: true },
          { key: "date1", type: "date", label: "Date cible du jalon 1", required: true },
          { key: "jalon2", type: "short_text", label: "Jalon 2" },
          { key: "date2", type: "date", label: "Date cible du jalon 2" },
          { key: "jalon3", type: "short_text", label: "Jalon 3" },
          { key: "date3", type: "date", label: "Date cible du jalon 3" },
          { key: "risques", type: "long_text", label: "Ce qui pourrait te bloquer" },
          {
            key: "besoins",
            type: "multi_choice",
            label: "De quoi as-tu besoin ?",
            options: ["Financement", "Associé", "Compétence technique", "Local", "Réseau", "Rien pour l'instant"],
          },
        ],
        tips: ["Un jalon doit être vérifiable : « site en ligne », pas « avancer sur le site »."],
        checklist: ["3 jalons datés", "Risques identifiés"],
        resultLabel: "Plan d'action 90 jours",
        estimatedMinutes: 30,
      },
      {
        slug: "bp-assembler-document",
        title: "Assembler ton business plan",
        objective: "Obtenir le document final, relu et prêt à être partagé.",
        explanation:
          "Toutes tes réponses précédentes sont réunies dans un document structuré. Il te reste à ajouter le résumé exécutif — la première page, celle qu'on lit vraiment.",
        instructions: [
          "Relis tes réponses des missions précédentes.",
          "Rédige le résumé exécutif en 10 lignes maximum.",
          "Valide la mission pour générer ton document.",
        ],
        fields: [
          { key: "titre_projet", type: "short_text", label: "Nom de ton projet", required: true },
          { key: "resume", type: "long_text", label: "Résumé exécutif (10 lignes max)", required: true },
          { key: "equipe", type: "long_text", label: "Qui porte le projet ?" },
        ],
        tips: ["Le résumé exécutif s'écrit en dernier, mais se lit en premier."],
        checklist: ["Résumé rédigé", "Document généré"],
        resultLabel: "Business plan complet",
        estimatedMinutes: 25,
      },
    ],
  },

  {
    slug: "creer-mon-cv-professionnel",
    title: "Créer mon CV professionnel",
    summary: "Un CV qui montre ta valeur, pas seulement ton parcours.",
    description:
      "En quatre missions, tu construis un CV clair, orienté résultats, adapté au poste que tu vises — et une accroche qui donne envie de te lire.",
    category: "carriere",
    level: "debutant",
    accessType: "paid",
    priceXof: 500,
    expectedResult: "Un CV structuré et une accroche professionnelle prêts à l'emploi.",
    accentColor: "or",
    missions: [
      {
        slug: "cv-cibler-le-poste",
        title: "Cibler le poste visé",
        objective: "Un CV générique ne convainc personne : on part du poste.",
        explanation:
          "Avant d'écrire, il faut savoir à qui tu écris. Cette mission fixe le poste, le secteur et les compétences attendues.",
        instructions: [
          "Nomme précisément le poste visé.",
          "Trouve une offre réelle correspondante et note les 5 compétences les plus citées.",
        ],
        fields: [
          { key: "poste", type: "short_text", label: "Poste visé", required: true },
          { key: "secteur", type: "short_text", label: "Secteur / type d'entreprise", required: true },
          { key: "competences", type: "long_text", label: "Les 5 compétences les plus demandées", required: true },
          {
            key: "experience",
            type: "single_choice",
            label: "Ton niveau d'expérience",
            options: ["Étudiant / premier emploi", "1 à 3 ans", "3 à 7 ans", "Plus de 7 ans"],
            required: true,
          },
        ],
        checklist: ["Poste identifié", "Compétences listées"],
        resultLabel: "Cible professionnelle",
        estimatedMinutes: 15,
      },
      {
        slug: "cv-experiences-resultats",
        title: "Transformer tes expériences en résultats",
        objective: "Passer de « responsable de… » à « a obtenu… ».",
        explanation:
          "Un recruteur retient les résultats, pas les intitulés. Pour chaque expérience, on cherche un chiffre ou un effet concret.",
        instructions: [
          "Liste tes 3 expériences les plus pertinentes pour ce poste.",
          "Pour chacune, écris ce que tu as obtenu, si possible avec un chiffre.",
        ],
        fields: [
          { key: "exp1", type: "long_text", label: "Expérience 1 — poste, structure, période, résultat", required: true },
          { key: "exp2", type: "long_text", label: "Expérience 2" },
          { key: "exp3", type: "long_text", label: "Expérience 3" },
          { key: "formation", type: "long_text", label: "Formation(s) principale(s)", required: true },
        ],
        prompts: [
          {
            title: "Reformuler une expérience en résultat",
            body: "Tu es recruteur. Reformule cette expérience en 2 lignes orientées résultat, avec un verbe d'action fort : [colle ton expérience].",
          },
        ],
        tips: ["Même sans chiffre, un effet concret suffit : « réduit les retards de livraison »."],
        pitfalls: ["Recopier une fiche de poste au lieu de décrire ce que tu as fait."],
        checklist: ["3 expériences reformulées"],
        resultLabel: "Expériences valorisées",
        estimatedMinutes: 35,
        aiAssist: true,
      },
      {
        slug: "cv-accroche",
        title: "Écrire ton accroche",
        objective: "Les 3 lignes qui décident si on lit la suite.",
        explanation:
          "L'accroche résume qui tu es, ce que tu apportes, et ce que tu cherches. Elle se place en haut du CV.",
        instructions: ["Rédige 3 lignes maximum.", "Mentionne ta spécialité, ton expérience clé et ton objectif."],
        fields: [
          { key: "accroche", type: "long_text", label: "Ton accroche (3 lignes max)", required: true },
          {
            key: "qualites",
            type: "multi_choice",
            label: "Tes 3 points forts",
            options: ["Rigueur", "Créativité", "Organisation", "Relationnel", "Analyse", "Autonomie", "Leadership", "Adaptabilité"],
          },
        ],
        checklist: ["Accroche écrite"],
        resultLabel: "Accroche professionnelle",
        estimatedMinutes: 20,
        aiAssist: true,
      },
      {
        slug: "cv-finaliser",
        title: "Finaliser et exporter",
        objective: "Assembler le CV et vérifier les derniers détails.",
        explanation: "Dernière relecture : cohérence, coordonnées, fautes. Puis génération du document.",
        instructions: ["Vérifie tes coordonnées.", "Relis à voix haute.", "Valide pour générer ton CV."],
        fields: [
          { key: "nom", type: "short_text", label: "Nom complet", required: true },
          { key: "contact", type: "short_text", label: "Téléphone et e-mail", required: true },
          { key: "liens", type: "short_text", label: "LinkedIn / portfolio (optionnel)" },
          { key: "langues", type: "short_text", label: "Langues parlées" },
        ],
        checklist: ["Coordonnées vérifiées", "CV généré"],
        resultLabel: "CV professionnel",
        estimatedMinutes: 15,
      },
    ],
  },

  {
    slug: "preparer-ma-soutenance",
    title: "Préparer ma soutenance",
    summary: "Structure, support et questions du jury : arriver serein le jour J.",
    description:
      "Un parcours gratuit pour préparer une soutenance de mémoire, de projet ou de stage : plan de présentation, support, et anticipation des questions.",
    category: "etudes",
    level: "debutant",
    accessType: "free",
    priceXof: 0,
    expectedResult: "Un plan de soutenance minuté et une liste de questions anticipées.",
    accentColor: "feuillage",
    missions: [
      {
        slug: "sout-structurer",
        title: "Structurer ta présentation",
        objective: "Un plan clair, minuté, qui tient dans le temps imparti.",
        explanation:
          "Le jury juge d'abord ta capacité à structurer. On construit un plan en 5 temps avec une durée pour chacun.",
        instructions: [
          "Note la durée totale autorisée.",
          "Répartis-la entre introduction, problématique, méthode, résultats et conclusion.",
        ],
        fields: [
          { key: "sujet", type: "short_text", label: "Sujet de ta soutenance", required: true },
          { key: "duree", type: "number", label: "Durée autorisée (minutes)", min: 5, max: 60, required: true },
          { key: "problematique", type: "long_text", label: "Ta problématique en une phrase", required: true },
          { key: "plan", type: "long_text", label: "Ton plan en 5 temps, avec les minutes", required: true },
        ],
        tips: ["Prévois 20 % de marge : on parle toujours plus longtemps que prévu."],
        pitfalls: ["Passer 10 minutes sur le contexte et 2 minutes sur les résultats."],
        checklist: ["Plan écrit", "Durées réparties"],
        resultLabel: "Plan de soutenance",
        estimatedMinutes: 30,
      },
      {
        slug: "sout-support",
        title: "Concevoir ton support",
        objective: "Des diapositives qui appuient ton discours au lieu de le remplacer.",
        explanation:
          "Une diapositive = une idée. Cette mission te fait poser le contenu de chaque diapositive avant de l'habiller.",
        instructions: ["Compte une diapositive par minute environ.", "Écris le titre et l'idée clé de chacune."],
        fields: [
          { key: "nb_slides", type: "number", label: "Nombre de diapositives prévues", min: 3, max: 60, required: true },
          { key: "contenu", type: "long_text", label: "Titre + idée clé de chaque diapositive", required: true },
          {
            key: "outil",
            type: "single_choice",
            label: "Avec quoi vas-tu le créer ?",
            options: ["PowerPoint", "Google Slides", "Canva", "Autre"],
          },
        ],
        tips: ["Pas plus de 25 mots par diapositive."],
        checklist: ["Contenu de chaque diapositive posé"],
        resultLabel: "Structure du support",
        estimatedMinutes: 40,
        tools: ["canva", "gamma"],
      },
      {
        slug: "sout-questions",
        title: "Anticiper les questions du jury",
        objective: "Ne plus être surpris : préparer les 8 questions les plus probables.",
        explanation:
          "Les questions du jury portent presque toujours sur les mêmes zones : limites de la méthode, choix non justifiés, portée des résultats.",
        instructions: [
          "Identifie les 3 points faibles de ton travail.",
          "Formule 8 questions probables et une piste de réponse pour chacune.",
        ],
        fields: [
          { key: "points_faibles", type: "long_text", label: "Les 3 points faibles de ton travail", required: true },
          { key: "questions", type: "long_text", label: "8 questions probables + pistes de réponse", required: true },
        ],
        prompts: [
          {
            title: "Questions probables du jury",
            body: "Tu es membre d'un jury exigeant. À partir de ce résumé [colle ton résumé], génère 8 questions probables classées par difficulté, avec des pistes de réponse.",
          },
        ],
        tips: ["Reconnaître une limite est mieux vu que la nier."],
        checklist: ["8 questions préparées"],
        resultLabel: "Questions anticipées",
        estimatedMinutes: 35,
        aiAssist: true,
      },
    ],
  },

  {
    slug: "creer-ma-strategie-marketing",
    title: "Créer ma stratégie marketing",
    summary: "Un plan d'acquisition concret plutôt qu'une liste d'intentions.",
    description:
      "Positionnement, message, canaux, calendrier : tu repars avec un plan marketing sur 30 jours applicable dès le lendemain.",
    category: "marketing",
    level: "intermediaire",
    accessType: "paid",
    priceXof: 2000,
    expectedResult: "Un plan marketing 30 jours avec messages et canaux définis.",
    accentColor: "or",
    missions: [
      {
        slug: "mkt-positionnement",
        title: "Poser ton positionnement",
        objective: "Savoir à qui tu parles et pourquoi ils devraient t'écouter.",
        explanation: "Le positionnement précède le message. Sans lui, toute communication sonne creux.",
        instructions: ["Décris ton client idéal.", "Écris ta promesse en une phrase."],
        fields: [
          { key: "client_ideal", type: "long_text", label: "Ton client idéal (âge, situation, besoin)", required: true },
          { key: "promesse", type: "short_text", label: "Ta promesse en une phrase", required: true },
          { key: "preuve", type: "long_text", label: "Qu'est-ce qui prouve que tu peux tenir cette promesse ?" },
        ],
        checklist: ["Client idéal décrit", "Promesse écrite"],
        resultLabel: "Positionnement",
        estimatedMinutes: 30,
        aiAssist: true,
      },
      {
        slug: "mkt-messages",
        title: "Écrire tes messages clés",
        objective: "Trois messages réutilisables partout.",
        explanation:
          "Plutôt que d'improviser à chaque publication, on prépare trois angles : le problème, la solution, la preuve.",
        instructions: ["Écris un message par angle.", "Décline chacun en version courte pour les réseaux."],
        fields: [
          { key: "message_probleme", type: "long_text", label: "Message « problème »", required: true },
          { key: "message_solution", type: "long_text", label: "Message « solution »", required: true },
          { key: "message_preuve", type: "long_text", label: "Message « preuve »", required: true },
        ],
        prompts: [
          {
            title: "Décliner un message",
            body: "Tu es rédacteur publicitaire. Décline ce message central [message] en une version vidéo courte, une version carrousel et une version story.",
          },
        ],
        resultLabel: "Messages clés",
        estimatedMinutes: 35,
        aiAssist: true,
      },
      {
        slug: "mkt-canaux",
        title: "Choisir tes canaux",
        objective: "Deux canaux bien tenus valent mieux que six abandonnés.",
        explanation: "On choisit en fonction de là où se trouve réellement ta cible, pas de la mode.",
        instructions: ["Sélectionne au maximum deux canaux principaux.", "Justifie chaque choix."],
        fields: [
          {
            key: "canaux",
            type: "multi_choice",
            label: "Tes canaux principaux (2 maximum)",
            options: ["WhatsApp", "Instagram", "TikTok", "Facebook", "LinkedIn", "E-mail", "Bouche-à-oreille", "Terrain"],
            required: true,
          },
          { key: "justification", type: "long_text", label: "Pourquoi ces canaux ?", required: true },
          { key: "frequence", type: "single_choice", label: "Rythme de publication tenable", options: ["1 fois / semaine", "2 à 3 fois / semaine", "Tous les jours"], required: true },
        ],
        pitfalls: ["Être présent partout et nulle part à la fois."],
        resultLabel: "Canaux retenus",
        estimatedMinutes: 25,
      },
      {
        slug: "mkt-calendrier",
        title: "Bâtir ton calendrier 30 jours",
        objective: "Sortir de l'improvisation avec un mois planifié.",
        explanation: "Le calendrier transforme la stratégie en habitude.",
        instructions: ["Planifie les sujets des 4 prochaines semaines.", "Fixe un indicateur de réussite."],
        fields: [
          { key: "semaine1", type: "long_text", label: "Semaine 1 — sujets", required: true },
          { key: "semaine2", type: "long_text", label: "Semaine 2 — sujets" },
          { key: "semaine3", type: "long_text", label: "Semaine 3 — sujets" },
          { key: "semaine4", type: "long_text", label: "Semaine 4 — sujets" },
          { key: "indicateur", type: "short_text", label: "Ton indicateur de réussite à 30 jours", required: true },
        ],
        checklist: ["4 semaines planifiées", "Indicateur défini"],
        resultLabel: "Calendrier marketing 30 jours",
        estimatedMinutes: 40,
      },
    ],
  },

  {
    slug: "developper-mes-reseaux-sociaux",
    title: "Développer mes réseaux sociaux",
    summary: "Ligne éditoriale, formats et régularité pour construire une audience.",
    description:
      "Un parcours gratuit pour poser une ligne éditoriale tenable et arrêter de publier au hasard.",
    category: "marketing",
    level: "debutant",
    accessType: "free",
    priceXof: 0,
    expectedResult: "Une ligne éditoriale et 12 idées de contenu prêtes à produire.",
    accentColor: "braise",
    missions: [
      {
        slug: "rs-ligne-editoriale",
        title: "Définir ta ligne éditoriale",
        objective: "Savoir de quoi tu parles, et de quoi tu ne parles pas.",
        explanation: "Trois piliers suffisent. Au-delà, ton audience ne comprend plus ce que tu fais.",
        instructions: ["Choisis 3 thèmes récurrents.", "Définis ton ton."],
        fields: [
          { key: "pilier1", type: "short_text", label: "Pilier 1", required: true },
          { key: "pilier2", type: "short_text", label: "Pilier 2", required: true },
          { key: "pilier3", type: "short_text", label: "Pilier 3" },
          {
            key: "ton",
            type: "single_choice",
            label: "Ton de ta communication",
            options: ["Pédagogue", "Inspirant", "Direct", "Humoristique", "Expert"],
            required: true,
          },
        ],
        resultLabel: "Ligne éditoriale",
        estimatedMinutes: 25,
        aiAssist: true,
      },
      {
        slug: "rs-idees-contenu",
        title: "Générer 12 idées de contenu",
        objective: "Un mois d'avance, pour ne plus jamais publier dans l'urgence.",
        explanation: "Quatre idées par pilier : tu tiens un mois à raison de trois publications par semaine.",
        instructions: ["Écris 4 idées par pilier.", "Note le format de chacune."],
        fields: [
          { key: "idees", type: "long_text", label: "Tes 12 idées, une par ligne", required: true },
          {
            key: "formats",
            type: "multi_choice",
            label: "Formats que tu maîtrises",
            options: ["Texte", "Carrousel", "Vidéo courte", "Story", "Live", "Photo"],
          },
        ],
        prompts: [
          {
            title: "Idées de contenu",
            body: "Tu es stratège en contenu. À partir de mon expertise [expertise] et de mon audience [audience], propose 12 idées de publications réparties sur 3 thèmes.",
          },
        ],
        resultLabel: "12 idées de contenu",
        estimatedMinutes: 30,
        aiAssist: true,
      },
      {
        slug: "rs-rythme",
        title: "Tenir un rythme réaliste",
        objective: "Choisir une fréquence que tu peux vraiment maintenir 3 mois.",
        explanation: "La régularité bat la quantité. Mieux vaut deux publications par semaine pendant six mois qu'une par jour pendant dix jours.",
        instructions: ["Choisis ta fréquence.", "Bloque des créneaux de production dans ton agenda."],
        fields: [
          { key: "frequence", type: "single_choice", label: "Ta fréquence", options: ["1 / semaine", "2 / semaine", "3 / semaine", "Tous les jours"], required: true },
          { key: "creneaux", type: "short_text", label: "Tes créneaux de production", placeholder: "Ex : dimanche 17 h - 19 h", required: true },
          { key: "date_debut", type: "date", label: "Date de démarrage" },
        ],
        checklist: ["Fréquence choisie", "Créneaux bloqués"],
        resultLabel: "Rythme de publication",
        estimatedMinutes: 15,
      },
    ],
  },

  {
    slug: "apprendre-lintelligence-artificielle",
    title: "Apprendre l'intelligence artificielle",
    summary: "Des bases solides pour utiliser l'IA au quotidien, sans jargon.",
    description:
      "Comprendre ce qu'est réellement une IA générative, écrire de bons prompts, et construire ton premier assistant personnalisé.",
    category: "ia",
    level: "debutant",
    accessType: "free",
    priceXof: 0,
    expectedResult: "Une bibliothèque de prompts personnels et un assistant configuré.",
    accentColor: "or",
    missions: [
      {
        slug: "ia-comprendre",
        title: "Comprendre ce qu'est une IA générative",
        objective: "Savoir ce que l'outil sait faire — et ce qu'il ne sait pas faire.",
        explanation:
          "Une IA générative prédit la suite la plus probable d'un texte. Elle n'a ni conscience ni certitude : d'où les erreurs présentées avec assurance, appelées hallucinations.",
        instructions: [
          "Teste un outil avec une question dont tu connais déjà la réponse.",
          "Note un cas où il s'est trompé.",
        ],
        fields: [
          {
            key: "outil_teste",
            type: "single_choice",
            label: "Quel outil as-tu testé ?",
            options: ["ChatGPT", "Claude", "Gemini", "Copilot", "Autre"],
            required: true,
          },
          { key: "erreur", type: "long_text", label: "Un cas où l'IA s'est trompée", required: true },
          { key: "apprentissage", type: "long_text", label: "Ce que tu en retiens" },
        ],
        tips: ["Vérifie toujours les chiffres, dates et noms propres."],
        resultLabel: "Premières observations",
        estimatedMinutes: 20,
      },
      {
        slug: "ia-bons-prompts",
        title: "Écrire de bons prompts",
        objective: "Passer de réponses génériques à des réponses utilisables.",
        explanation:
          "Un bon prompt donne un rôle, un contexte, une tâche précise et un format de sortie attendu.",
        instructions: [
          "Reprends une demande que tu as déjà faite à une IA.",
          "Réécris-la avec rôle + contexte + tâche + format.",
          "Compare les deux réponses.",
        ],
        fields: [
          { key: "prompt_avant", type: "long_text", label: "Ta demande initiale", required: true },
          { key: "prompt_apres", type: "long_text", label: "Ta version améliorée", required: true },
          { key: "difference", type: "long_text", label: "Quelle différence dans la réponse ?" },
        ],
        tips: ["« Agis comme… » + « Voici le contexte… » + « Donne-moi… sous forme de… »."],
        pitfalls: ["Demander trop de choses dans un seul prompt."],
        checklist: ["Prompt réécrit", "Comparaison faite"],
        resultLabel: "Méthode de prompt",
        estimatedMinutes: 30,
      },
      {
        slug: "ia-assistant",
        title: "Créer ton assistant personnalisé",
        objective: "Un assistant qui connaît ton contexte et te fait gagner du temps chaque semaine.",
        explanation:
          "Plutôt que de réexpliquer ton activité à chaque conversation, tu écris une fois des instructions permanentes.",
        instructions: ["Décris ton activité en 5 lignes.", "Écris les instructions permanentes de ton assistant."],
        fields: [
          { key: "usage", type: "short_text", label: "À quoi va servir ton assistant ?", required: true },
          { key: "instructions", type: "long_text", label: "Ses instructions permanentes", required: true },
          {
            key: "taches",
            type: "multi_choice",
            label: "Tâches qu'il prendra en charge",
            options: ["Rédaction", "Résumé", "Traduction", "Idées", "Relecture", "Analyse", "Planification"],
          },
        ],
        checklist: ["Assistant configuré", "Testé sur une vraie tâche"],
        resultLabel: "Assistant IA personnalisé",
        estimatedMinutes: 35,
        aiAssist: true,
      },
    ],
  },

  {
    slug: "structurer-mon-idee",
    title: "Structurer mon idée",
    summary: "Le parcours le plus court : d'une intuition floue à un projet posé.",
    description:
      "Trois missions pour clarifier une idée, vérifier qu'elle tient debout, et décider de la suite.",
    category: "projet",
    level: "debutant",
    accessType: "free",
    priceXof: 0,
    expectedResult: "Une fiche projet claire et une décision motivée.",
    accentColor: "feuillage",
    missions: [
      {
        slug: "idee-formuler",
        title: "Formuler ton idée",
        objective: "Sortir l'idée de ta tête et la poser noir sur blanc.",
        explanation: "Tant qu'une idée reste mentale, elle paraît parfaite. Écrite, elle devient discutable — donc améliorable.",
        instructions: ["Décris l'idée sans te censurer.", "Résume-la ensuite en une phrase."],
        fields: [
          { key: "idee_brute", type: "long_text", label: "Ton idée, telle qu'elle te vient", required: true },
          { key: "une_phrase", type: "short_text", label: "La même en une phrase", required: true },
          { key: "declencheur", type: "long_text", label: "Qu'est-ce qui t'a donné cette idée ?" },
        ],
        resultLabel: "Idée formulée",
        estimatedMinutes: 15,
      },
      {
        slug: "idee-tester",
        title: "Tester ta solidité",
        objective: "Confronter l'idée à cinq questions qui font mal.",
        explanation: "Mieux vaut découvrir un problème maintenant qu'après six mois de travail.",
        instructions: ["Réponds honnêtement, sans défendre ton idée."],
        fields: [
          { key: "besoin", type: "long_text", label: "Qui a vraiment ce besoin, aujourd'hui ?", required: true },
          { key: "existant", type: "long_text", label: "Comment font-ils sans toi ?", required: true },
          { key: "payer", type: "single_choice", label: "Seraient-ils prêts à payer ?", options: ["Oui, sûrement", "Peut-être", "Non", "Je ne sais pas"], required: true },
          { key: "capacite", type: "long_text", label: "Qu'est-ce qui te manque pour le faire ?", required: true },
        ],
        pitfalls: ["Répondre ce qu'on aimerait entendre."],
        resultLabel: "Test de solidité",
        estimatedMinutes: 25,
      },
      {
        slug: "idee-decider",
        title: "Décider de la suite",
        objective: "Garder, ajuster ou abandonner — mais décider.",
        explanation: "Une idée non tranchée occupe l'esprit sans avancer. Cette mission force la décision.",
        instructions: ["Choisis ta décision.", "Note la prochaine action concrète."],
        fields: [
          { key: "decision", type: "single_choice", label: "Ta décision", options: ["Je continue", "J'ajuste puis je continue", "Je mets en pause", "J'abandonne"], required: true },
          { key: "raison", type: "long_text", label: "Pourquoi ?", required: true },
          { key: "prochaine_action", type: "short_text", label: "Ta prochaine action concrète", required: true },
          { key: "echeance", type: "date", label: "Pour quand ?" },
        ],
        checklist: ["Décision prise", "Prochaine action datée"],
        resultLabel: "Fiche projet",
        estimatedMinutes: 20,
      },
    ],
  },

  {
    slug: "lancer-mon-activite",
    title: "Développer mon activité",
    summary: "Structurer une activité existante pour la faire grandir.",
    description:
      "Pour celles et ceux qui vendent déjà : clarifier l'offre, fixer les prix, et mettre en place un suivi client.",
    category: "business",
    level: "intermediaire",
    accessType: "premium",
    priceXof: 0,
    expectedResult: "Une offre reformulée, une grille tarifaire et un suivi client simple.",
    accentColor: "braise",
    missions: [
      {
        slug: "act-clarifier-offre",
        title: "Clarifier ton offre",
        objective: "Une offre lisible se vend mieux qu'une offre riche.",
        explanation: "Trop de choix paralyse le client. On resserre à trois formules maximum.",
        instructions: ["Liste tout ce que tu proposes.", "Regroupe en trois formules maximum."],
        fields: [
          { key: "offre_actuelle", type: "long_text", label: "Tout ce que tu proposes aujourd'hui", required: true },
          { key: "formule1", type: "short_text", label: "Formule 1", required: true },
          { key: "formule2", type: "short_text", label: "Formule 2" },
          { key: "formule3", type: "short_text", label: "Formule 3" },
        ],
        resultLabel: "Offre clarifiée",
        estimatedMinutes: 30,
      },
      {
        slug: "act-prix",
        title: "Fixer tes prix",
        objective: "Des prix qui couvrent tes coûts et reflètent ta valeur.",
        explanation: "Le prix se construit à partir du coût, du marché et de la valeur perçue — pas seulement du ressenti.",
        instructions: ["Calcule ton coût par formule.", "Compare au marché.", "Fixe ton prix."],
        fields: [
          { key: "cout_formule1", type: "number", label: "Coût de revient formule 1 (FCFA)", min: 0, required: true },
          { key: "prix_formule1", type: "number", label: "Prix de vente formule 1 (FCFA)", min: 0, required: true },
          { key: "prix_marche", type: "long_text", label: "Prix pratiqués par les autres" },
          { key: "justification", type: "long_text", label: "Ce qui justifie ton prix", required: true },
        ],
        pitfalls: ["Se positionner au prix le plus bas par défaut."],
        resultLabel: "Grille tarifaire",
        estimatedMinutes: 35,
      },
      {
        slug: "act-suivi-client",
        title: "Mettre en place un suivi client",
        objective: "Arrêter de perdre des clients faute de relance.",
        explanation: "Un suivi simple, même sur un tableur, rapporte plus que la prospection à froid.",
        instructions: ["Choisis ton support de suivi.", "Définis tes moments de relance."],
        fields: [
          { key: "support", type: "single_choice", label: "Ton support de suivi", options: ["Tableur", "Notion", "Carnet papier", "Outil dédié"], required: true },
          { key: "champs_suivi", type: "long_text", label: "Les informations que tu suivras par client", required: true },
          { key: "relance", type: "short_text", label: "Ton rythme de relance", required: true },
        ],
        checklist: ["Support choisi", "Premier client enregistré"],
        resultLabel: "Système de suivi client",
        estimatedMinutes: 25,
      },
    ],
  },

  {
    slug: "creer-du-contenu-avec-lia",
    title: "Créer du contenu avec l'IA",
    summary: "Produire plus, sans perdre ta voix.",
    description:
      "Méthode complète pour utiliser l'IA comme assistant de production de contenu tout en gardant un ton personnel reconnaissable.",
    category: "creation",
    level: "intermediaire",
    accessType: "premium",
    priceXof: 0,
    expectedResult: "Un système de production de contenu assisté par IA.",
    accentColor: "or",
    missions: [
      {
        slug: "cnt-voix",
        title: "Définir ta voix",
        objective: "Pour que l'IA écrive comme toi, il faut d'abord savoir comment tu écris.",
        explanation: "On extrait les caractéristiques de ton style à partir de tes propres textes.",
        instructions: ["Colle trois de tes textes.", "Identifie ce qui revient : longueur, ton, vocabulaire."],
        fields: [
          { key: "textes", type: "long_text", label: "Trois de tes textes", required: true },
          { key: "caracteristiques", type: "long_text", label: "Ce qui caractérise ton style", required: true },
          { key: "interdits", type: "long_text", label: "Les mots et tournures que tu n'utilises jamais" },
        ],
        resultLabel: "Guide de voix",
        estimatedMinutes: 30,
        aiAssist: true,
      },
      {
        slug: "cnt-chaine",
        title: "Construire ta chaîne de production",
        objective: "Un enchaînement reproductible : idée → plan → brouillon → relecture.",
        explanation: "L'IA intervient sur le plan et le brouillon ; l'idée et la relecture restent à toi.",
        instructions: ["Écris le prompt de chaque étape.", "Teste la chaîne sur un contenu réel."],
        fields: [
          { key: "prompt_plan", type: "long_text", label: "Ton prompt pour générer un plan", required: true },
          { key: "prompt_brouillon", type: "long_text", label: "Ton prompt pour le brouillon", required: true },
          { key: "test", type: "long_text", label: "Résultat de ton test" },
        ],
        resultLabel: "Chaîne de production",
        estimatedMinutes: 40,
        aiAssist: true,
      },
    ],
  },
];

/* ------------------------------------------------------------------
   Objectifs — « Que veux-tu accomplir ? »
   ------------------------------------------------------------------ */

export const goals: SeedGoal[] = [
  {
    slug: "creer-mon-business",
    title: "Créer mon business",
    tagline: "De l'idée au business plan présentable",
    description: "Structurer ton projet d'entreprise, valider ton modèle et préparer un document qui convainc.",
    icon: "Rocket",
    outcome: "Un business plan complet",
    category: "business",
    featured: true,
    pathways: ["creer-mon-business-plan", "structurer-mon-idee"],
  },
  {
    slug: "preparer-mon-projet-academique",
    title: "Préparer mon projet académique",
    tagline: "Mémoire, rapport, projet de fin d'études",
    description: "Structurer ton travail académique et le mener jusqu'au bout avec méthode.",
    icon: "GraduationCap",
    outcome: "Un plan de travail structuré",
    category: "etudes",
    pathways: ["preparer-ma-soutenance"],
  },
  {
    slug: "preparer-ma-soutenance",
    title: "Préparer ma soutenance",
    tagline: "Arriver serein devant le jury",
    description: "Plan minuté, support clair et questions du jury anticipées.",
    icon: "Presentation",
    outcome: "Une soutenance préparée",
    category: "etudes",
    featured: true,
    pathways: ["preparer-ma-soutenance"],
  },
  {
    slug: "creer-mon-cv",
    title: "Créer mon CV",
    tagline: "Un CV qui montre ta valeur",
    description: "Un CV orienté résultats, adapté au poste que tu vises.",
    icon: "FileUser",
    outcome: "Un CV professionnel",
    category: "carriere",
    featured: true,
    pathways: ["creer-mon-cv-professionnel"],
  },
  {
    slug: "developper-mon-activite",
    title: "Développer mon activité",
    tagline: "Faire grandir ce qui existe déjà",
    description: "Clarifier ton offre, fixer tes prix, suivre tes clients.",
    icon: "TrendingUp",
    outcome: "Une activité structurée",
    category: "business",
    pathways: ["lancer-mon-activite", "creer-ma-strategie-marketing"],
  },
  {
    slug: "creer-une-strategie-marketing",
    title: "Créer une stratégie marketing",
    tagline: "Un plan d'acquisition concret",
    description: "Positionnement, messages, canaux et calendrier sur 30 jours.",
    icon: "Megaphone",
    outcome: "Un plan marketing 30 jours",
    category: "marketing",
    featured: true,
    pathways: ["creer-ma-strategie-marketing"],
  },
  {
    slug: "developper-mes-reseaux-sociaux",
    title: "Développer mes réseaux sociaux",
    tagline: "Publier avec méthode, pas au hasard",
    description: "Ligne éditoriale, idées de contenu et rythme tenable.",
    icon: "Share2",
    outcome: "Une ligne éditoriale et 12 contenus",
    category: "marketing",
    pathways: ["developper-mes-reseaux-sociaux"],
  },
  {
    slug: "creer-du-contenu",
    title: "Créer du contenu",
    tagline: "Produire plus sans perdre ta voix",
    description: "Utiliser l'IA comme assistant de production, pas comme remplaçant.",
    icon: "PenLine",
    outcome: "Un système de production",
    category: "creation",
    pathways: ["creer-du-contenu-avec-lia"],
  },
  {
    slug: "apprendre-lia",
    title: "Apprendre l'intelligence artificielle",
    tagline: "Comprendre et utiliser l'IA au quotidien",
    description: "Les bases, les bons prompts, et ton premier assistant personnalisé.",
    icon: "Sparkles",
    outcome: "Une pratique autonome de l'IA",
    category: "ia",
    featured: true,
    pathways: ["apprendre-lintelligence-artificielle"],
  },
  {
    slug: "structurer-une-idee",
    title: "Structurer une idée",
    tagline: "Clarifier avant de se lancer",
    description: "Formuler, tester et décider — en trois missions.",
    icon: "Lightbulb",
    outcome: "Une fiche projet claire",
    category: "projet",
    featured: true,
    pathways: ["structurer-mon-idee"],
  },
  {
    slug: "creer-un-projet",
    title: "Créer un projet",
    tagline: "Passer de l'intention au plan",
    description: "Cadrer, planifier et suivre un projet du début à la fin.",
    icon: "KanbanSquare",
    outcome: "Un projet planifié",
    category: "projet",
    pathways: ["structurer-mon-idee", "creer-mon-business-plan"],
  },
  {
    slug: "autre-objectif",
    title: "Un autre objectif",
    tagline: "Dis-nous ce que tu veux accomplir",
    description: "Ton objectif n'est pas dans la liste ? Décris-le, nous t'orientons vers le parcours le plus proche.",
    icon: "Compass",
    outcome: "Une orientation personnalisée",
    category: "projet",
    pathways: [],
  },
];

/* ------------------------------------------------------------------ */

export const tools = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    description: "Assistant conversationnel généraliste pour la rédaction, l'analyse et le brainstorm.",
    url: "https://chat.openai.com",
    pricing: "Gratuit · version avancée payante",
    category: "ia",
    isFree: true,
    useCases: ["Rédaction", "Brainstorm", "Analyse de documents"],
    features: ["Génération de texte", "Analyse d'image", "Navigation web"],
    howToUse: [
      "Crée un compte gratuit sur chat.openai.com",
      "Décris ton rôle et ton objectif dès le premier message",
      "Utilise une conversation par projet pour garder le contexte clair",
      "Relis toujours les réponses avant de les utiliser",
    ],
  },
  {
    slug: "claude",
    name: "Claude",
    description: "Assistant IA solide sur la rédaction longue, l'analyse de documents et le code.",
    url: "https://claude.ai",
    pricing: "Gratuit · abonnement Pro payant",
    category: "ia",
    isFree: true,
    useCases: ["Rédaction longue", "Analyse de documents", "Code"],
    features: ["Grande fenêtre de contexte", "Analyse de fichiers", "Génération de code"],
    howToUse: [
      "Crée un compte sur claude.ai",
      "Pour un document long, envoie le fichier plutôt que de copier le texte",
      "Utilise les Projets pour garder des instructions permanentes",
    ],
  },
  {
    slug: "gemini",
    name: "Gemini",
    description: "Assistant de Google, intégré à Docs, Gmail et à la recherche.",
    url: "https://gemini.google.com",
    pricing: "Gratuit · version avancée payante",
    category: "ia",
    isFree: true,
    useCases: ["Recherche", "Rédaction", "Productivité bureautique"],
    features: ["Intégration Google", "Analyse d'image", "Réponses sourcées"],
    howToUse: ["Connecte-toi avec ton compte Google", "Utilise-le directement dans Docs et Gmail"],
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    description: "Moteur de recherche IA qui cite ses sources — idéal pour une étude de marché.",
    url: "https://perplexity.ai",
    pricing: "Gratuit · Pro payant",
    category: "ia",
    isFree: true,
    useCases: ["Recherche", "Veille", "Étude de marché"],
    features: ["Sources citées", "Recherche approfondie", "Suivi de sujets"],
    howToUse: ["Pose une question précise", "Vérifie systématiquement les sources citées"],
  },
  {
    slug: "canva",
    name: "Canva",
    description: "Création graphique accessible : visuels réseaux sociaux, présentations, CV.",
    url: "https://canva.com",
    pricing: "Gratuit · Pro payant",
    category: "creation",
    isFree: true,
    useCases: ["Visuels réseaux sociaux", "Présentations", "CV"],
    features: ["Modèles prêts", "Retouche IA", "Travail collaboratif"],
    howToUse: ["Pars d'un modèle plutôt que d'une page blanche", "Reste sur 2 polices maximum"],
  },
  {
    slug: "notion",
    name: "Notion",
    description: "Espace de travail tout-en-un : notes, bases de données, suivi de projet.",
    url: "https://notion.so",
    pricing: "Gratuit · payant en équipe",
    category: "productivite",
    isFree: true,
    useCases: ["Prise de notes", "Suivi client", "Gestion de projet"],
    features: ["Bases de données", "Modèles", "Assistant IA intégré"],
    howToUse: ["Commence par un seul espace", "Ajoute une base de données quand le besoin apparaît"],
  },
  {
    slug: "gamma",
    name: "Gamma",
    description: "Génération de présentations à partir d'un simple plan de texte.",
    url: "https://gamma.app",
    pricing: "Gratuit avec crédits · payant",
    category: "creation",
    isFree: true,
    useCases: ["Soutenance", "Pitch", "Présentation client"],
    features: ["Génération automatique", "Mise en forme", "Export PDF"],
    howToUse: ["Colle ton plan", "Ajuste ensuite chaque diapositive à la main"],
  },
  {
    slug: "elevenlabs",
    name: "ElevenLabs",
    description: "Synthèse vocale réaliste pour vidéos, podcasts et modules de formation.",
    url: "https://elevenlabs.io",
    pricing: "Gratuit avec quota · payant",
    category: "creation",
    isFree: true,
    useCases: ["Voix off", "Podcast", "Vidéo"],
    features: ["Voix naturelles", "Multilingue", "Clonage de voix"],
    howToUse: ["Écris un texte ponctué", "Teste plusieurs voix avant de produire"],
  },
];

export const prompts = [
  {
    slug: "synthese-de-marche",
    title: "Synthèse de marché en 5 points",
    body: "Tu es analyste marché. À partir de [secteur] et [zone géographique], liste 5 tendances clés, 3 concurrents directs et 2 opportunités sous-exploitées.",
    category: "business",
    tags: ["business plan", "étude de marché"],
    accessType: "free" as const,
  },
  {
    slug: "tester-un-modele-economique",
    title: "Tester un modèle économique",
    body: "Tu es conseiller en stratégie. Pour une offre [description] destinée à [cible], propose 3 modèles de revenus possibles avec leurs avantages et risques.",
    category: "business",
    tags: ["business plan", "modèle économique"],
    accessType: "premium" as const,
  },
  {
    slug: "ligne-editoriale",
    title: "Ligne éditoriale personal branding",
    body: "Tu es stratège en contenu. À partir de [expertise] et [audience cible], propose 3 formats récurrents et 10 idées de sujets pour un mois.",
    category: "marketing",
    tags: ["réseaux sociaux", "contenu"],
    accessType: "free" as const,
  },
  {
    slug: "decliner-un-message",
    title: "Décliner un message de campagne",
    body: "Tu es rédacteur publicitaire. Décline ce message central [message] en une version vidéo courte, une version carrousel et une version story.",
    category: "marketing",
    tags: ["campagne", "réseaux sociaux"],
    accessType: "premium" as const,
  },
  {
    slug: "questions-du-jury",
    title: "Questions probables du jury",
    body: "Tu es membre d'un jury exigeant. À partir de ce résumé de mémoire [résumé], génère 8 questions probables classées par difficulté, avec des pistes de réponse.",
    category: "etudes",
    tags: ["soutenance", "mémoire"],
    accessType: "free" as const,
  },
  {
    slug: "plan-de-revision",
    title: "Plan de révision sur 2 semaines",
    body: "Tu es tuteur pédagogique. Pour l'examen de [matière] dans [nombre] jours, construis un planning jour par jour couvrant [chapitres].",
    category: "etudes",
    tags: ["révisions", "examen"],
    accessType: "free" as const,
  },
  {
    slug: "direction-artistique",
    title: "Direction artistique en 3 mots",
    body: "Tu es directeur artistique. À partir de ces 3 mots [mot1, mot2, mot3] qui décrivent ma marque, propose une palette de couleurs et 2 pistes typographiques cohérentes.",
    category: "creation",
    tags: ["identité visuelle", "branding"],
    accessType: "free" as const,
  },
  {
    slug: "script-video-90-secondes",
    title: "Script vidéo de 90 secondes",
    body: "Tu es scénariste. Écris un script de 90 secondes pour présenter [produit] à [audience] : accroche, problème, solution, appel à l'action.",
    category: "creation",
    tags: ["vidéo", "script"],
    accessType: "premium" as const,
  },
  {
    slug: "prioriser-sa-semaine",
    title: "Prioriser sa semaine",
    body: "Tu es coach en productivité. Voici mes tâches de la semaine [liste]. Classe-les par urgence et importance, puis propose 3 priorités par jour.",
    category: "productivite",
    tags: ["organisation", "priorités"],
    accessType: "free" as const,
  },
  {
    slug: "reformuler-une-experience",
    title: "Reformuler une expérience en résultat",
    body: "Tu es recruteur. Reformule cette expérience en 2 lignes orientées résultat, avec un verbe d'action fort : [expérience].",
    category: "carriere",
    tags: ["CV", "recrutement"],
    accessType: "free" as const,
  },
];

export const resources = [
  {
    slug: "guide-business-plan",
    title: "Modèle de business plan (structure type)",
    description: "La trame en 6 sections utilisée dans le parcours business plan, à réutiliser librement.",
    type: "template" as const,
    category: "business",
    accessType: "free" as const,
  },
  {
    slug: "checklist-avant-soutenance",
    title: "Checklist avant soutenance",
    description: "Les 15 points à vérifier la veille de ta soutenance.",
    type: "checklist" as const,
    category: "etudes",
    accessType: "free" as const,
  },
  {
    slug: "creer-des-revenus-avec-ia-et-saas",
    title: "Créer des revenus avec l'IA et le SaaS",
    description:
      "Le guide pratique pour comprendre le SaaS à l'ère de l'IA, ses opportunités concrètes, et la méthode étape par étape pour lancer son produit numérique.",
    type: "pdf" as const,
    category: "business",
    accessType: "premium" as const,
  },
  {
    slug: "bibliotheque-de-prompts",
    title: "Bibliothèque de prompts Xwé IA",
    description: "Tous les prompts de la plateforme, classés par objectif.",
    type: "article" as const,
    category: "ia",
    accessType: "free" as const,
  },
];

export const games = [
  {
    slug: "bases-de-lia",
    title: "Les bases de l'IA",
    description: "Vocabulaire essentiel, grands concepts et idées reçues sur l'intelligence artificielle.",
    icon: "Brain",
    level: "debutant" as const,
    accessType: "free" as const,
    challenges: [
      {
        title: "Vocabulaire de l'IA",
        questions: [
          {
            question: "Que signifie l'acronyme « IA » ?",
            options: ["Intelligence Artificielle", "Interface Automatisée", "Information Analytique", "Interaction Adaptative"],
            correctIndex: 0,
            explanation: "IA signifie Intelligence Artificielle.",
          },
          {
            question: "Qu'est-ce qu'un prompt ?",
            options: ["Un bug du modèle", "L'instruction donnée à l'IA", "Le nom du modèle", "Une mise à jour"],
            correctIndex: 1,
            explanation: "Un prompt est l'instruction fournie à l'IA pour orienter sa réponse.",
          },
          {
            question: "Que veut dire « LLM » ?",
            options: ["Large Language Model", "Logical Learning Machine", "Linked Language Memory", "Local Language Module"],
            correctIndex: 0,
            explanation: "LLM signifie « Large Language Model », un grand modèle de langage.",
          },
          {
            question: "Qu'est-ce qu'une hallucination pour une IA générative ?",
            options: ["Un bug d'affichage", "Une réponse fausse présentée avec assurance", "Une panne serveur", "Un message d'erreur"],
            correctIndex: 1,
            explanation: "Une hallucination est une information incorrecte générée de façon convaincante.",
          },
          {
            question: "À quoi sert la fenêtre de contexte ?",
            options: ["Au thème visuel", "À la quantité de texte que le modèle peut prendre en compte", "Au fuseau horaire", "À la langue"],
            correctIndex: 1,
            explanation: "La fenêtre de contexte est ce que le modèle peut « voir » à un instant donné.",
          },
        ],
      },
    ],
  },
  {
    slug: "prompt-engineering",
    title: "Maîtriser le prompt engineering",
    description: "Structurer une bonne instruction et éviter les pièges classiques.",
    icon: "Wand2",
    level: "intermediaire" as const,
    accessType: "free" as const,
    challenges: [
      {
        title: "Bonnes pratiques",
        questions: [
          {
            question: "Quel est l'intérêt principal du prompt engineering ?",
            options: ["Programmer l'IA en Python", "Obtenir de meilleures réponses en formulant mieux la demande", "Installer l'IA", "Créer une base de données"],
            correctIndex: 1,
            explanation: "Il s'agit de formuler ses instructions pour obtenir de meilleurs résultats.",
          },
          {
            question: "Quelle structure donne généralement les meilleurs résultats ?",
            options: ["Une question très courte", "Rôle + contexte + tâche + format attendu", "Plusieurs demandes à la fois", "Uniquement des mots-clés"],
            correctIndex: 1,
            explanation: "Donner un rôle, un contexte, une tâche précise et un format attendu améliore nettement la réponse.",
          },
          {
            question: "Que faire si la réponse est trop générique ?",
            options: ["Reposer la même question", "Ajouter du contexte et des contraintes précises", "Changer d'outil", "Écrire en majuscules"],
            correctIndex: 1,
            explanation: "Une réponse générique vient presque toujours d'un prompt trop vague.",
          },
          {
            question: "Faut-il vérifier les chiffres donnés par une IA ?",
            options: ["Non, ils sont fiables", "Oui, systématiquement", "Seulement les grands nombres", "Uniquement en anglais"],
            correctIndex: 1,
            explanation: "Les chiffres, dates et noms propres doivent toujours être vérifiés.",
          },
        ],
      },
    ],
  },
  {
    slug: "ia-et-business",
    title: "IA et stratégie business",
    description: "Comment l'IA transforme le modèle économique, le marketing et la décision.",
    icon: "TrendingUp",
    level: "intermediaire" as const,
    accessType: "premium" as const,
    challenges: [
      {
        title: "IA en entreprise",
        questions: [
          {
            question: "Quel est le premier gain de l'IA pour une petite entreprise ?",
            options: ["Remplacer les employés", "Gagner du temps sur les tâches répétitives", "Augmenter les prix", "Supprimer la comptabilité"],
            correctIndex: 1,
            explanation: "Le gain principal est le temps libéré sur les tâches répétitives.",
          },
          {
            question: "Quelle donnée ne faut-il jamais coller dans une IA publique ?",
            options: ["Un texte marketing", "Des données clients confidentielles", "Une idée de slogan", "Un plan de publication"],
            correctIndex: 1,
            explanation: "Les données personnelles ou confidentielles ne doivent pas être envoyées à un outil public.",
          },
          {
            question: "Comment mesurer l'apport de l'IA dans une activité ?",
            options: ["Au nombre de prompts", "Au temps gagné et à la qualité produite", "Au coût de l'abonnement", "Au nombre d'outils utilisés"],
            correctIndex: 1,
            explanation: "L'apport se mesure au temps gagné et à la qualité du résultat, pas au volume d'usage.",
          },
        ],
      },
    ],
  },
];

export const faq = [
  {
    question: "Qu'est-ce que Xwé IA exactement ?",
    answer:
      "Xwé IA est une plateforme d'accompagnement par objectif. Tu choisis ce que tu veux accomplir, la plateforme te propose un parcours composé de missions, et à la fin tu obtiens un résultat concret : un business plan, un CV, une stratégie marketing, un plan de soutenance.",
    category: "Général",
  },
  {
    question: "En quoi est-ce différent de ChatGPT ?",
    answer:
      "ChatGPT répond à des questions. Xwé IA te fait avancer : un parcours structuré, des missions dans un ordre pensé, tes réponses conservées, ta progression suivie et un livrable à la fin. L'IA est un outil du parcours, pas le produit.",
    category: "Général",
  },
  {
    question: "Faut-il payer pour commencer ?",
    answer:
      "Non. Plusieurs parcours complets sont gratuits, ainsi que la Discussion, l'Arène et les Outils IA. Tu ne paies que si tu veux un parcours payant précis ou l'abonnement Premium.",
    category: "Tarifs",
  },
  {
    question: "Comment fonctionne le paiement ?",
    answer:
      "Les paiements se font en francs CFA via Mobile Money ou carte bancaire. Tu peux acheter un parcours à l'unité, ou prendre l'abonnement Premium qui ouvre l'ensemble du catalogue.",
    category: "Tarifs",
  },
  {
    question: "Quelle différence entre un parcours payant et Premium ?",
    answer:
      "Un parcours payant s'achète une fois et reste accessible. Premium est un abonnement mensuel qui ouvre tous les parcours, y compris ceux réservés aux abonnés, ainsi que les ressources avancées.",
    category: "Tarifs",
  },
  {
    question: "Mes réponses sont-elles conservées ?",
    answer:
      "Oui. Chaque mission enregistre tes réponses au fur et à mesure. Tu peux quitter et revenir : tu reprends exactement où tu t'étais arrêté, et tout est rassemblé dans « Mes résultats ».",
    category: "Utilisation",
  },
  {
    question: "Puis-je utiliser Xwé IA sur mobile ?",
    answer:
      "Oui, la plateforme est conçue mobile d'abord. La navigation, le lecteur de mission et la saisie sont pensés pour un usage au pouce, sur une connexion modeste.",
    category: "Utilisation",
  },
  {
    question: "Puis-je supprimer mon compte ?",
    answer:
      "Oui, depuis Paramètres. La suppression efface ton compte, tes réponses, tes résultats et tes sessions.",
    category: "Compte",
  },
];

export const legalPages = [
  {
    slug: "conditions",
    title: "Conditions d'utilisation",
    body: `## 1. Objet

Les présentes conditions régissent l'utilisation de la plateforme Xwé IA, qui propose un accompagnement par objectif : parcours guidés, missions, outils et ressources.

## 2. Compte

La création d'un compte requiert une adresse e-mail valide. Tu es responsable de la confidentialité de ton mot de passe et des activités menées depuis ton compte.

## 3. Accès aux contenus

Certains parcours sont gratuits, d'autres payants à l'unité, d'autres réservés aux abonnés Premium. Un parcours acheté à l'unité reste accessible sans limite de durée, sauf mention contraire au moment de l'achat.

## 4. Paiements

Les paiements sont réalisés en francs CFA via un prestataire tiers. Xwé IA ne stocke aucune donnée bancaire.

## 5. Contenus produits

Les réponses que tu saisis et les documents générés t'appartiennent. Xwé IA ne les exploite pas à d'autres fins que te les restituer.

## 6. Usage de l'intelligence artificielle

Certaines fonctionnalités s'appuient sur des modèles d'IA. Leurs réponses peuvent comporter des erreurs : elles doivent être relues et vérifiées avant tout usage engageant.

## 7. Comportement

Les espaces communautaires imposent le respect. Tout contenu haineux, frauduleux ou illégal peut être supprimé et le compte suspendu.

## 8. Résiliation

Tu peux supprimer ton compte à tout moment depuis les Paramètres.

## 9. Modification

Ces conditions peuvent évoluer. Les utilisateurs sont informés des changements importants.`,
  },
  {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    body: `## Données collectées

Nous collectons uniquement ce qui est nécessaire au fonctionnement du service :

- **Compte** : nom, adresse e-mail, mot de passe chiffré.
- **Profil** : nom d'affichage, domaine, niveau, objectifs et centres d'intérêt renseignés à l'onboarding.
- **Activité** : réponses aux missions, progression, résultats, favoris.
- **Technique** : sessions de connexion, horodatage.

## Utilisation

Ces données servent à te fournir le service : afficher ta progression, conserver tes réponses, personnaliser les recommandations, gérer ton accès aux contenus payants.

## Partage

Aucune donnée n'est vendue. Des prestataires techniques interviennent uniquement pour l'hébergement, l'envoi d'e-mails et le paiement, dans la limite de ce qui leur est nécessaire.

## Sécurité

Les mots de passe sont hachés. Les jetons de session sont stockés sous forme hachée. Les clés d'API restent exclusivement côté serveur.

## Tes droits

Tu peux consulter, corriger ou supprimer tes données depuis ton espace Paramètres. La suppression du compte entraîne l'effacement des données associées.

## Conservation

Les données sont conservées tant que le compte est actif, puis supprimées.

## Contact

Pour toute question relative à tes données, écris-nous depuis la page Contact.`,
  },
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    body: `## Éditeur

Xwé IA — plateforme d'accompagnement par objectif assistée par intelligence artificielle.

## Hébergement

L'application est hébergée sur une infrastructure cloud ; la base de données est hébergée séparément chez un fournisseur PostgreSQL managé.

## Propriété intellectuelle

La marque Xwé IA, son identité visuelle et les contenus pédagogiques de la plateforme sont protégés. Les contenus que tu produis dans tes missions restent ta propriété.

## Responsabilité

Xwé IA fournit un accompagnement méthodologique. Les décisions professionnelles, financières ou académiques prises à partir des contenus relèvent de la seule responsabilité de l'utilisateur.`,
  },
];
