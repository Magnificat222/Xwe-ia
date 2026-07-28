import type { Prompt } from "@/types";

export const prompts: Prompt[] = [
  {
    id: "pr-business-plan",
    title: "Synthèse de marché en 5 points",
    content:
      "Tu es analyste marché. À partir de [secteur] et [zone géographique], liste 5 tendances clés, 3 concurrents directs et 2 opportunités sous-exploitées.",
    categorySlug: "business",
    tags: ["business plan", "étude de marché"],
    isPremium: false,
    recommendedToolIds: ["tool-perplexity", "tool-chatgpt"],
  },
  {
    id: "pr-modele-economique",
    title: "Tester un modèle économique",
    content:
      "Tu es conseiller en stratégie. Pour une offre [description de l'offre] destinée à [cible], propose 3 modèles de revenus possibles avec leurs avantages et risques respectifs.",
    categorySlug: "business",
    tags: ["business plan", "modèle économique"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-personal-branding",
    title: "Ligne éditoriale personal branding",
    content:
      "Tu es stratège en contenu. À partir de [expertise] et [audience cible], propose 3 formats de contenu récurrents et 10 idées de sujets pour un mois.",
    categorySlug: "marketing",
    tags: ["réseaux sociaux", "contenu"],
    isPremium: false,
    recommendedToolIds: ["tool-chatgpt", "tool-gemini"],
  },
  {
    id: "pr-campagne-message",
    title: "Décliner un message de campagne",
    content:
      "Tu es rédacteur publicitaire. À partir de ce message central [message], décline-le en une version vidéo courte, une version carrousel et une version story.",
    categorySlug: "marketing",
    tags: ["campagne", "réseaux sociaux"],
    isPremium: true,
    recommendedToolIds: ["tool-chatgpt", "tool-invideo", "tool-canva"],
  },
  {
    id: "pr-soutenance",
    title: "Questions probables du jury",
    content:
      "Tu es membre d'un jury exigeant. À partir de ce résumé de mémoire [résumé], génère 8 questions probables classées par difficulté, avec des pistes de réponse.",
    categorySlug: "etudes",
    tags: ["soutenance", "mémoire"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-plan-revision",
    title: "Plan de révision sur 2 semaines",
    content:
      "Tu es tuteur pédagogique. Pour l'examen de [matière] dans [nombre] jours, construis un planning de révision jour par jour couvrant [liste des chapitres].",
    categorySlug: "etudes",
    tags: ["révisions", "examen"],
    isPremium: false,
    recommendedToolIds: ["tool-chatgpt", "tool-gemini"],
  },
  {
    id: "pr-identite-visuelle",
    title: "Direction artistique en 3 mots",
    content:
      "Tu es directeur artistique. À partir de ces 3 mots [mot1, mot2, mot3] qui décrivent ma marque, propose une palette de couleurs et 2 pistes typographiques cohérentes.",
    categorySlug: "creation",
    tags: ["identité visuelle", "branding"],
    isPremium: false,
    recommendedToolIds: ["tool-canva", "tool-chatgpt"],
  },
  {
    id: "pr-script-video",
    title: "Script vidéo de présentation en 90 secondes",
    content:
      "Tu es scénariste. Écris un script de 90 secondes pour présenter [produit/service] à [audience], structuré en accroche, problème, solution et appel à l'action.",
    categorySlug: "creation",
    tags: ["vidéo", "script"],
    isPremium: true,
    recommendedToolIds: ["tool-chatgpt", "tool-heygen", "tool-invideo", "tool-elevenlabs"],
  },
  {
    id: "pr-priorisation-semaine",
    title: "Prioriser sa semaine",
    content:
      "Tu es coach en productivité. Voici ma liste de tâches de la semaine [liste]. Classe-les par urgence et importance, et propose mes 3 priorités pour chaque jour.",
    categorySlug: "productivite",
    tags: ["organisation", "priorités"],
    isPremium: false,
    recommendedToolIds: ["tool-notion-ai", "tool-chatgpt"],
  },
  {
    id: "pr-systeme-notes",
    title: "Structurer un système de prise de notes",
    content:
      "Tu es expert en organisation personnelle. Pour un usage [professionnel/étudiant/créatif], propose une structure de notes en 4 catégories maximum, avec un exemple de contenu pour chacune.",
    categorySlug: "productivite",
    tags: ["notes", "organisation"],
    isPremium: true,
    recommendedToolIds: ["tool-notion-ai", "tool-claude"],
  },
  {
    id: "pr-architecture-projet",
    title: "Cadrer l'architecture d'un projet web",
    content:
      "Tu es architecte logiciel. Pour un projet [description du projet] avec [contraintes], propose une architecture simple adaptée à une première version, avec les technologies recommandées.",
    categorySlug: "developpement",
    tags: ["architecture", "web"],
    isPremium: false,
    recommendedToolIds: ["tool-claude", "tool-deepseek"],
  },
  {
    id: "pr-debug-erreur",
    title: "Diagnostiquer une erreur de code",
    content:
      "Tu es développeur senior. Voici une erreur [message d'erreur] rencontrée dans ce contexte [contexte/code]. Explique la cause probable et propose une correction.",
    categorySlug: "developpement",
    tags: ["debug", "code"],
    isPremium: true,
    recommendedToolIds: ["tool-github-copilot", "tool-deepseek", "tool-claude"],
  },
  {
    id: "pr-bases-prompt",
    title: "Prompt de base réutilisable",
    content:
      "Tu es [rôle précis]. Ton objectif est [objectif]. Ton audience est [audience]. Réponds toujours de façon [ton/format souhaité].",
    categorySlug: "ia",
    tags: ["prompt engineering", "bases"],
    isPremium: false,
    recommendedToolIds: ["tool-chatgpt", "tool-claude", "tool-gemini"],
  },
  {
    id: "pr-assistant-personnalise",
    title: "Rédiger des instructions permanentes",
    content:
      "Tu es concepteur d'assistants IA. Aide-moi à rédiger des instructions permanentes pour un assistant dédié à [métier/usage], incluant son rôle, ses limites et le contexte récurrent à connaître.",
    categorySlug: "ia",
    tags: ["assistant personnalisé", "instructions"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-reperer-automatisation",
    title: "Repérer une tâche à automatiser",
    content:
      "Tu es consultant en automatisation. Voici une liste de mes tâches récurrentes [liste]. Identifie les 3 plus faciles à automatiser en premier et pourquoi.",
    categorySlug: "automatisation",
    tags: ["automatisation", "productivité"],
    isPremium: false,
    recommendedToolIds: ["tool-chatgpt", "tool-zapier"],
  },
  {
    id: "pr-workflow-schema",
    title: "Cartographier un workflow complet",
    content:
      "Tu es expert en processus métier. Décris étape par étape ce processus [description du processus], en identifiant les points où une automatisation apporterait le plus de valeur.",
    categorySlug: "automatisation",
    tags: ["workflow", "process"],
    isPremium: true,
    recommendedToolIds: ["tool-manus", "tool-zapier", "tool-claude"],
  },
  {
    id: "pr-jalons-projet",
    title: "Découper un projet en jalons",
    content:
      "Tu es chef de projet expérimenté. Pour ce projet [objectif du projet] avec une échéance de [délai], propose 4 à 5 jalons mesurables avec une estimation de durée pour chacun.",
    categorySlug: "gestion-de-projet",
    tags: ["planification", "jalons"],
    isPremium: false,
    recommendedToolIds: ["tool-clickup", "tool-chatgpt"],
  },
  {
    id: "pr-gestion-blocages",
    title: "Anticiper les risques d'un projet",
    content:
      "Tu es gestionnaire de risques. Pour ce projet [description], liste les 5 risques les plus probables, leur impact potentiel, et une action préventive pour chacun.",
    categorySlug: "gestion-de-projet",
    tags: ["risques", "pilotage"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-clickup"],
  },

  // --- Prompts Premium ajoutés ---
  {
    id: "pr-pitch-investisseur-30s",
    title: "Pitch investisseur en 30 secondes",
    content:
      "Tu es coach en pitch pour investisseurs. À partir de [description du projet], [marché visé] et [traction actuelle], rédige un pitch oral de 30 secondes qui capte l'attention dès la première phrase et se termine par une demande claire.",
    categorySlug: "business",
    tags: ["pitch", "investisseurs"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-objections-negociation",
    title: "Anticiper les objections d'un client",
    content:
      "Tu es négociateur commercial expérimenté. Pour cette offre [description de l'offre] proposée à [type de client], liste les 5 objections les plus probables et une réponse convaincante et honnête pour chacune.",
    categorySlug: "business",
    tags: ["négociation", "objections"],
    isPremium: true,
    recommendedToolIds: ["tool-chatgpt", "tool-claude"],
  },
  {
    id: "pr-calendrier-editorial-90j",
    title: "Calendrier éditorial sur 90 jours",
    content:
      "Tu es stratège de contenu. À partir de ces 3 piliers de contenu [pilier 1, pilier 2, pilier 3] et de cette audience [description de l'audience], génère un calendrier de 12 semaines avec un sujet par semaine et le format recommandé.",
    categorySlug: "marketing",
    tags: ["calendrier éditorial", "stratégie"],
    isPremium: true,
    recommendedToolIds: ["tool-chatgpt", "tool-notion-ai"],
  },
  {
    id: "pr-sequence-relance-email",
    title: "Séquence de relance e-mail après abandon",
    content:
      "Tu es spécialiste en marketing automation. Pour un visiteur ayant consulté [offre] sans acheter, rédige une séquence de 3 e-mails de relance espacés dans le temps, chacun avec un angle différent et un objet accrocheur.",
    categorySlug: "marketing",
    tags: ["email marketing", "conversion"],
    isPremium: true,
    recommendedToolIds: ["tool-chatgpt", "tool-zapier"],
  },
  {
    id: "pr-rapporteur-severe-memoire",
    title: "Rapporteur sévère pour relecture de mémoire",
    content:
      "Tu es un rapporteur de jury exigeant et sans complaisance. Lis cette partie de mémoire [texte ou résumé de la partie] et identifie les 5 faiblesses les plus critiques : logique, sourcing, méthodologie ou clarté.",
    categorySlug: "etudes",
    tags: ["mémoire", "relecture critique"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-perplexity"],
  },
  {
    id: "pr-territoire-marque",
    title: "Définir un territoire de marque",
    content:
      "Tu es directeur artistique. À partir de ces valeurs [valeurs de la marque] et de cette cible [cible], propose 3 directions de territoire de marque distinctes, chacune avec une palette de couleurs, un ton et une référence visuelle.",
    categorySlug: "creation",
    tags: ["identité visuelle", "branding"],
    isPremium: true,
    recommendedToolIds: ["tool-canva", "tool-chatgpt"],
  },
  {
    id: "pr-routine-semaine-ideale",
    title: "Concevoir sa semaine de travail idéale",
    content:
      "Tu es coach en productivité. À partir de ces priorités [liste des priorités] et de ces contraintes [contraintes horaires], propose un modèle de semaine type avec des blocs de temps dédiés à chaque priorité.",
    categorySlug: "productivite",
    tags: ["routine", "organisation"],
    isPremium: true,
    recommendedToolIds: ["tool-notion-ai", "tool-clickup"],
  },
  {
    id: "pr-revue-code-securite",
    title: "Revue de code orientée sécurité",
    content:
      "Tu es expert en sécurité applicative. Analyse ce code [extrait de code] et identifie les failles de sécurité potentielles (injection, données sensibles exposées, validation manquante), classées par gravité.",
    categorySlug: "developpement",
    tags: ["sécurité", "revue de code"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-github-copilot"],
  },
  {
    id: "pr-synthese-veille-hebdo",
    title: "Synthèse de veille hebdomadaire",
    content:
      "Tu es analyste de veille. À partir de ces articles et sources de la semaine [liste de titres ou liens], produis une synthèse d'une page classée par thème, avec pour chaque point une phrase d'implication concrète pour mon activité [secteur].",
    categorySlug: "ia",
    tags: ["veille", "synthèse"],
    isPremium: true,
    recommendedToolIds: ["tool-perplexity", "tool-notion-ai"],
  },
];
