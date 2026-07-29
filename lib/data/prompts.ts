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
  {
    id: "pr-automatisation-zapier",
    title: "Configurer une automatisation Zapier étape par étape",
    content:
      "Tu es expert Zapier. Pour automatiser [processus à automatiser], configure un Zap complet : déclencheur exact, 3-4 actions en séquence avec les champs à mapper, filtres conditionnels, et tests à réaliser. Fournis un schéma textuel du workflow et les pièges à éviter.",
    categorySlug: "automatisation",
    tags: ["zapier", "no-code", "automatisation"],
    isPremium: true,
    recommendedToolIds: ["tool-zapier", "tool-claude"],
  },
  {
    id: "pr-automatiser-social-media",
    title: "Automatiser la publication sur les réseaux sociaux",
    content:
      "Tu es expert en automatisation des réseaux sociaux. Pour publier sur [plateformes] avec un rythme de [fréquence], propose un système d'automatisation complet : outil recommandé (Buffer, Later, Zapier, etc.), workflow de création batch, template de calendrier, et KPIs à suivre pour mesurer l'efficacité.",
    categorySlug: "automatisation",
    tags: ["réseaux sociaux", "automatisation", "publication"],
    isPremium: true,
    recommendedToolIds: ["tool-zapier", "tool-chatgpt"],
  },

  // ─── GESTION DE PROJET ───
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
    id: "pr-bibliographie-annotee",
    title: "Structurer une bibliographie annotée",
    content:
      "Tu es bibliothécaire de recherche. Pour le sujet [sujet de recherche], propose une bibliographie annotée de 8 sources (articles académiques, livres, rapports) : pour chaque source, donne le titre, l'auteur, l'année, et un résumé de 3 lignes expliquant sa pertinence pour le sujet.",
    categorySlug: "etudes",
    tags: ["bibliographie", "recherche", "sources"],
    isPremium: true,
    recommendedToolIds: ["tool-perplexity", "tool-claude"],
  },

  // ─── CRÉATION ───
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
    id: "pr-business-model-canvas",
    title: "Remplir un Business Model Canvas complet",
    content:
      "Tu es expert en Lean Startup. Pour le projet [description], remplis les 9 cases du Business Model Canvas : segments clients, propositions de valeur, canaux, relation client, sources de revenus, ressources clés, activités clés, partenariats clés, structure de coûts. Pour chaque case, donne 2-3 éléments concrets.",
    categorySlug: "business",
    tags: ["business model", "lean startup", "canvas"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },

  // ─── MARKETING ───
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
    id: "pr-chain-prompt-complexe",
    title: "Construire une chaîne de prompts complexe",
    content:
      "Tu es expert en chaînes de prompts (prompt chaining). Pour atteindre cet objectif final [objectif], découpe-le en 4 à 6 étapes, chacune étant un prompt autonome qui prend en entrée la sortie de l'étape précédente. Pour chaque étape, rédige le prompt complet avec ses variables d'entrée et le format de sortie attendu.",
    categorySlug: "ia",
    tags: ["prompt chaining", "automation", "workflow IA"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt", "tool-manus"],
  },

  // ─── AUTOMATISATION ───
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
    id: "pr-code-review",
    title: "Faire une revue de code complète",
    content:
      "Tu es lead développeur senior. Analyse ce code [code] selon 5 critères : lisibilité, performance, sécurité, maintenabilité et conventions. Pour chaque critère, donne une note sur 10, identifie les problèmes et propose des corrections concrètes avec le code corrigé.",
    categorySlug: "developpement",
    tags: ["code review", "qualité", "développement"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-deepseek", "tool-github-copilot"],
  },
  {
    id: "pr-comparer-modeles-ia",
    title: "Comparer les modèles IA pour un usage précis",
    content:
      "Tu es analyste en outils IA. Pour l'usage [type de tâche : rédaction, code, image, voix, recherche], compare 4 modèles IA actuels sur : qualité de sortie, vitesse de réponse, coût, taille de contexte, et cas d'usage idéal. Conclue par une recommandation adaptée à un profil [budget/niveau technique].",
    categorySlug: "ia",
    tags: ["comparaison", "modèles IA", "choix d'outil"],
    isPremium: true,
    recommendedToolIds: ["tool-perplexity", "tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-competitive-analysis",
    title: "Analyse concurrentielle détaillée",
    content:
      "Tu es analyste concurrentiel senior. Pour le produit/service [nom] opérant dans [secteur], dresse un tableau comparatif avec 5 concurrents directs sur : positionnement, pricing, force principale, faiblesse principale, part de marché estimée. Conclue par 3 angles différenciants exploitables.",
    categorySlug: "business",
    tags: ["concurrents", "analyse de marché", "stratégie"],
    isPremium: true,
    recommendedToolIds: ["tool-perplexity", "tool-claude"],
  },
  {
    id: "pr-compte-rendu-reunion",
    title: "Rédiger un compte-rendu de réunion structuré",
    content:
      "Tu es secrétaire de réunion expert. À partir de ces notes brutes de réunion [notes], rédige un compte-rendu structuré en : participants, décisions prises, actions à réaliser (avec responsable et deadline), points à suivre, et date de la prochaine réunion. Format concis, max 1 page.",
    categorySlug: "gestion-de-projet",
    tags: ["compte-rendu", "réunion", "organisation"],
    isPremium: true,
    recommendedToolIds: ["tool-notion-ai", "tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-contenu-seo",
    title: "Planifier un calendrier de contenu SEO",
    content:
      "Tu es expert en content marketing SEO. Pour le site [URL ou domaine] positionné sur [thème principal], propose un calendrier de 12 articles sur 3 mois : titre SEO-friendly, mot-clé principal, mot-clés secondaires, angle éditorial, longueur cible, et CTA proposé. Chaque article doit répondre à une intention de recherche précise.",
    categorySlug: "marketing",
    tags: ["SEO", "contenu", "planification"],
    isPremium: true,
    recommendedToolIds: ["tool-perplexity", "tool-chatgpt"],
  },
  {
    id: "pr-email-professionnel",
    title: "Rédiger un e-mail professionnel difficile",
    content:
      "Tu es expert en communication d'entreprise. Rédige un e-mail professionnel pour [situation : relance, réclamation, négociation, annonce difficile] destiné à [destinataire]. Le ton doit être [ton souhaité]. Inclue une ligne d'objet efficace, un corps structuré en 3 paragraphes maximum, et une formule de politesse adaptée.",
    categorySlug: "productivite",
    tags: ["email", "communication", "professionnel"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },

  // ─── DÉVELOPPEMENT ───
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
    id: "pr-generer-images-prompt",
    title: "Créer des prompts pour génération d'images IA",
    content:
      "Tu es expert en prompt d'images IA. Pour obtenir des visuels de [description du visuel souhaité], rédige 5 prompts optimisés pour Midjourney / DALL-E / Stable Diffusion. Pour chaque prompt, précise : le sujet principal, le style artistique, l'éclairage, la composition, et les paramètres techniques recommandés (aspect ratio, résolution).",
    categorySlug: "creation",
    tags: ["images IA", "midjourney", "dall-e"],
    isPremium: true,
    recommendedToolIds: ["tool-chatgpt", "tool-claude"],
  },

  // ─── PRODUCTIVITÉ ───
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
    id: "pr-generer-tests-unitaires",
    title: "Générer des tests unitaires complets",
    content:
      "Tu es ingénieur QA. Pour ce module/fonction [code ou description], génère des tests unitaires couvrant : cas nominaux, cas limites, cas d'erreur, et cas edge. Utilise le framework [framework de test]. Chaque test doit avoir un nom explicite et une assertion claire.",
    categorySlug: "developpement",
    tags: ["tests", "qualité", "automatisation"],
    isPremium: true,
    recommendedToolIds: ["tool-github-copilot", "tool-claude", "tool-deepseek"],
  },

  // ─── IA ───
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
    id: "pr-landing-page-copy",
    title: "Rédiger le copy d'une landing page",
    content:
      "Tu es copywriter de conversion. Rédige le texte complet d'une landing page pour [produit/service] ciblant [audience]. Structure : headline accrocheuse, sous-titre, 3 bénéfices clés en bullet points, preuve sociale (témoignage fictif réaliste), CTA final. Le ton doit être [ton souhaité].",
    categorySlug: "marketing",
    tags: ["landing page", "copywriting", "conversion"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-pitch-deck-structure",
    title: "Structurer un pitch deck en 10 slides",
    content:
      "Tu es consultant en fundraising. Pour un projet [description du projet] au stade [stade : idée / MVP / traction], rédige le contenu exact de chaque slide d'un pitch deck de 10 pages : problème, solution, marché, modèle économique, traction, équipe, demande, road-map. Chaque slide doit tenir en 2-3 phrases percutantes.",
    categorySlug: "business",
    tags: ["pitch deck", "fundraising", "investisseurs"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-problematique-recherche",
    title: "Formuler une problématique de recherche",
    content:
      "Tu es chercheur académique. À partir de ce sujet de mémoire [sujet] et ce contexte [contexte], propose 3 formulations de problématique précises, chacune accompagnée de 2 sous-questions de recherche et d'une méthode d'investigation recommandée.",
    categorySlug: "etudes",
    tags: ["mémoire", "recherche", "problématique"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-rapport-hebdo",
    title: "Rédiger un rapport hebdomadaire automatique",
    content:
      "Tu es assistant de gestion. À partir de mes notes de la semaine [notes brutes], rédige un rapport hebdomadaire structuré en : accomplissements clés (3-5 points), blocages rencontrés, objectifs de la semaine suivante, et métriques importantes. Format : épuré, actionnable, max 1 page.",
    categorySlug: "productivite",
    tags: ["rapport", "reporting", "hebdo"],
    isPremium: true,
    recommendedToolIds: ["tool-notion-ai", "tool-claude"],
  },
  {
    id: "pr-retrospective-sprint",
    title: "Animer une rétrospective de sprint",
    content:
      "Tu est Scrum Master expérimenté. Pour animer une rétrospective de sprint d'une équipe de [taille] personnes après un sprint sur [sujet], propose : le format recommandé (4L, Start-Stop-Continue, ou autre), 5 questions à poser, un template de tableau récapitulatif, et 3 actions concrètes à mettre en place pour le sprint suivant.",
    categorySlug: "gestion-de-projet",
    tags: ["agile", "sprint", "rétrospective", "équipe"],
    isPremium: true,
    recommendedToolIds: ["tool-clickup", "tool-claude"],
  },
  {
    id: "pr-storytelling-marque",
    title: "Rédiger le storytelling de marque",
    content:
      "Tu es narrateur de marque. Pour [marque/projet], rédige un storytelling de 300 mots structuré en : l'origine (pourquoi ce projet existe), le conflit (quel problème il résout), la résolution (comment il transforme la vie de ses utilisateurs), et la vision (où il veut aller). Le ton doit être [ton souhaité].",
    categorySlug: "creation",
    tags: ["storytelling", "marque", "narration"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-strategie-reseaux-30j",
    title: "Stratégie réseaux sociaux sur 30 jours",
    content:
      "Tu es community manager senior. Pour [marque/profil] sur [plateforme], élabore un plan de 30 jours avec : 4 piliers de contenu, fréquence de publication recommandée, 5 idées de contenus par semaine (alternance format), 3 hashtags principaux, et 2 indicateurs de performance à suivre. Inclus un exemple de post complet pour le jour 1.",
    categorySlug: "marketing",
    tags: ["réseaux sociaux", "stratégie", "calendrier"],
    isPremium: true,
    recommendedToolIds: ["tool-chatgpt", "tool-gemini"],
  },

  // ─── ÉTUDES ───
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
    id: "pr-automatisation-zapier",
    title: "Configurer une automatisation Zapier étape par étape",
    content:
      "Tu es expert Zapier. Pour automatiser [processus à automatiser], configure un Zap complet : déclencheur exact, 3-4 actions en séquence avec les champs à mapper, filtres conditionnels, et tests à réaliser. Fournis un schéma textuel du workflow et les pièges à éviter.",
    categorySlug: "automatisation",
    tags: ["zapier", "no-code", "automatisation"],
    isPremium: true,
    recommendedToolIds: ["tool-zapier", "tool-claude"],
  },
  {
    id: "pr-automatiser-social-media",
    title: "Automatiser la publication sur les réseaux sociaux",
    content:
      "Tu es expert en automatisation des réseaux sociaux. Pour publier sur [plateformes] avec un rythme de [fréquence], propose un système d'automatisation complet : outil recommandé (Buffer, Later, Zapier, etc.), workflow de création batch, template de calendrier, et KPIs à suivre pour mesurer l'efficacité.",
    categorySlug: "automatisation",
    tags: ["réseaux sociaux", "automatisation", "publication"],
    isPremium: true,
    recommendedToolIds: ["tool-zapier", "tool-chatgpt"],
  },

  // ─── GESTION DE PROJET ───
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
    id: "pr-bibliographie-annotee",
    title: "Structurer une bibliographie annotée",
    content:
      "Tu es bibliothécaire de recherche. Pour le sujet [sujet de recherche], propose une bibliographie annotée de 8 sources (articles académiques, livres, rapports) : pour chaque source, donne le titre, l'auteur, l'année, et un résumé de 3 lignes expliquant sa pertinence pour le sujet.",
    categorySlug: "etudes",
    tags: ["bibliographie", "recherche", "sources"],
    isPremium: true,
    recommendedToolIds: ["tool-perplexity", "tool-claude"],
  },

  // ─── CRÉATION ───
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
    id: "pr-business-model-canvas",
    title: "Remplir un Business Model Canvas complet",
    content:
      "Tu es expert en Lean Startup. Pour le projet [description], remplis les 9 cases du Business Model Canvas : segments clients, propositions de valeur, canaux, relation client, sources de revenus, ressources clés, activités clés, partenariats clés, structure de coûts. Pour chaque case, donne 2-3 éléments concrets.",
    categorySlug: "business",
    tags: ["business model", "lean startup", "canvas"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },

  // ─── MARKETING ───
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
    id: "pr-chain-prompt-complexe",
    title: "Construire une chaîne de prompts complexe",
    content:
      "Tu es expert en chaînes de prompts (prompt chaining). Pour atteindre cet objectif final [objectif], découpe-le en 4 à 6 étapes, chacune étant un prompt autonome qui prend en entrée la sortie de l'étape précédente. Pour chaque étape, rédige le prompt complet avec ses variables d'entrée et le format de sortie attendu.",
    categorySlug: "ia",
    tags: ["prompt chaining", "automation", "workflow IA"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt", "tool-manus"],
  },

  // ─── AUTOMATISATION ───
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
    id: "pr-code-review",
    title: "Faire une revue de code complète",
    content:
      "Tu es lead développeur senior. Analyse ce code [code] selon 5 critères : lisibilité, performance, sécurité, maintenabilité et conventions. Pour chaque critère, donne une note sur 10, identifie les problèmes et propose des corrections concrètes avec le code corrigé.",
    categorySlug: "developpement",
    tags: ["code review", "qualité", "développement"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-deepseek", "tool-github-copilot"],
  },
  {
    id: "pr-comparer-modeles-ia",
    title: "Comparer les modèles IA pour un usage précis",
    content:
      "Tu es analyste en outils IA. Pour l'usage [type de tâche : rédaction, code, image, voix, recherche], compare 4 modèles IA actuels sur : qualité de sortie, vitesse de réponse, coût, taille de contexte, et cas d'usage idéal. Conclue par une recommandation adaptée à un profil [budget/niveau technique].",
    categorySlug: "ia",
    tags: ["comparaison", "modèles IA", "choix d'outil"],
    isPremium: true,
    recommendedToolIds: ["tool-perplexity", "tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-competitive-analysis",
    title: "Analyse concurrentielle détaillée",
    content:
      "Tu es analyste concurrentiel senior. Pour le produit/service [nom] opérant dans [secteur], dresse un tableau comparatif avec 5 concurrents directs sur : positionnement, pricing, force principale, faiblesse principale, part de marché estimée. Conclue par 3 angles différenciants exploitables.",
    categorySlug: "business",
    tags: ["concurrents", "analyse de marché", "stratégie"],
    isPremium: true,
    recommendedToolIds: ["tool-perplexity", "tool-claude"],
  },
  {
    id: "pr-compte-rendu-reunion",
    title: "Rédiger un compte-rendu de réunion structuré",
    content:
      "Tu es secrétaire de réunion expert. À partir de ces notes brutes de réunion [notes], rédige un compte-rendu structuré en : participants, décisions prises, actions à réaliser (avec responsable et deadline), points à suivre, et date de la prochaine réunion. Format concis, max 1 page.",
    categorySlug: "gestion-de-projet",
    tags: ["compte-rendu", "réunion", "organisation"],
    isPremium: true,
    recommendedToolIds: ["tool-notion-ai", "tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-contenu-seo",
    title: "Planifier un calendrier de contenu SEO",
    content:
      "Tu es expert en content marketing SEO. Pour le site [URL ou domaine] positionné sur [thème principal], propose un calendrier de 12 articles sur 3 mois : titre SEO-friendly, mot-clé principal, mot-clés secondaires, angle éditorial, longueur cible, et CTA proposé. Chaque article doit répondre à une intention de recherche précise.",
    categorySlug: "marketing",
    tags: ["SEO", "contenu", "planification"],
    isPremium: true,
    recommendedToolIds: ["tool-perplexity", "tool-chatgpt"],
  },
  {
    id: "pr-email-professionnel",
    title: "Rédiger un e-mail professionnel difficile",
    content:
      "Tu es expert en communication d'entreprise. Rédige un e-mail professionnel pour [situation : relance, réclamation, négociation, annonce difficile] destiné à [destinataire]. Le ton doit être [ton souhaité]. Inclue une ligne d'objet efficace, un corps structuré en 3 paragraphes maximum, et une formule de politesse adaptée.",
    categorySlug: "productivite",
    tags: ["email", "communication", "professionnel"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },

  // ─── DÉVELOPPEMENT ───
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
    id: "pr-generer-images-prompt",
    title: "Créer des prompts pour génération d'images IA",
    content:
      "Tu es expert en prompt d'images IA. Pour obtenir des visuels de [description du visuel souhaité], rédige 5 prompts optimisés pour Midjourney / DALL-E / Stable Diffusion. Pour chaque prompt, précise : le sujet principal, le style artistique, l'éclairage, la composition, et les paramètres techniques recommandés (aspect ratio, résolution).",
    categorySlug: "creation",
    tags: ["images IA", "midjourney", "dall-e"],
    isPremium: true,
    recommendedToolIds: ["tool-chatgpt", "tool-claude"],
  },

  // ─── PRODUCTIVITÉ ───
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
    id: "pr-generer-tests-unitaires",
    title: "Générer des tests unitaires complets",
    content:
      "Tu es ingénieur QA. Pour ce module/fonction [code ou description], génère des tests unitaires couvrant : cas nominaux, cas limites, cas d'erreur, et cas edge. Utilise le framework [framework de test]. Chaque test doit avoir un nom explicite et une assertion claire.",
    categorySlug: "developpement",
    tags: ["tests", "qualité", "automatisation"],
    isPremium: true,
    recommendedToolIds: ["tool-github-copilot", "tool-claude", "tool-deepseek"],
  },

  // ─── IA ───
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
    id: "pr-landing-page-copy",
    title: "Rédiger le copy d'une landing page",
    content:
      "Tu es copywriter de conversion. Rédige le texte complet d'une landing page pour [produit/service] ciblant [audience]. Structure : headline accrocheuse, sous-titre, 3 bénéfices clés en bullet points, preuve sociale (témoignage fictif réaliste), CTA final. Le ton doit être [ton souhaité].",
    categorySlug: "marketing",
    tags: ["landing page", "copywriting", "conversion"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-pitch-deck-structure",
    title: "Structurer un pitch deck en 10 slides",
    content:
      "Tu es consultant en fundraising. Pour un projet [description du projet] au stade [stade : idée / MVP / traction], rédige le contenu exact de chaque slide d'un pitch deck de 10 pages : problème, solution, marché, modèle économique, traction, équipe, demande, road-map. Chaque slide doit tenir en 2-3 phrases percutantes.",
    categorySlug: "business",
    tags: ["pitch deck", "fundraising", "investisseurs"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-problematique-recherche",
    title: "Formuler une problématique de recherche",
    content:
      "Tu es chercheur académique. À partir de ce sujet de mémoire [sujet] et ce contexte [contexte], propose 3 formulations de problématique précises, chacune accompagnée de 2 sous-questions de recherche et d'une méthode d'investigation recommandée.",
    categorySlug: "etudes",
    tags: ["mémoire", "recherche", "problématique"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-rapport-hebdo",
    title: "Rédiger un rapport hebdomadaire automatique",
    content:
      "Tu es assistant de gestion. À partir de mes notes de la semaine [notes brutes], rédige un rapport hebdomadaire structuré en : accomplissements clés (3-5 points), blocages rencontrés, objectifs de la semaine suivante, et métriques importantes. Format : épuré, actionnable, max 1 page.",
    categorySlug: "productivite",
    tags: ["rapport", "reporting", "hebdo"],
    isPremium: true,
    recommendedToolIds: ["tool-notion-ai", "tool-claude"],
  },
  {
    id: "pr-retrospective-sprint",
    title: "Animer une rétrospective de sprint",
    content:
      "Tu est Scrum Master expérimenté. Pour animer une rétrospective de sprint d'une équipe de [taille] personnes après un sprint sur [sujet], propose : le format recommandé (4L, Start-Stop-Continue, ou autre), 5 questions à poser, un template de tableau récapitulatif, et 3 actions concrètes à mettre en place pour le sprint suivant.",
    categorySlug: "gestion-de-projet",
    tags: ["agile", "sprint", "rétrospective", "équipe"],
    isPremium: true,
    recommendedToolIds: ["tool-clickup", "tool-claude"],
  },
  {
    id: "pr-storytelling-marque",
    title: "Rédiger le storytelling de marque",
    content:
      "Tu es narrateur de marque. Pour [marque/projet], rédige un storytelling de 300 mots structuré en : l'origine (pourquoi ce projet existe), le conflit (quel problème il résout), la résolution (comment il transforme la vie de ses utilisateurs), et la vision (où il veut aller). Le ton doit être [ton souhaité].",
    categorySlug: "creation",
    tags: ["storytelling", "marque", "narration"],
    isPremium: true,
    recommendedToolIds: ["tool-claude", "tool-chatgpt"],
  },
  {
    id: "pr-strategie-reseaux-30j",
    title: "Stratégie réseaux sociaux sur 30 jours",
    content:
      "Tu es community manager senior. Pour [marque/profil] sur [plateforme], élabore un plan de 30 jours avec : 4 piliers de contenu, fréquence de publication recommandée, 5 idées de contenus par semaine (alternance format), 3 hashtags principaux, et 2 indicateurs de performance à suivre. Inclus un exemple de post complet pour le jour 1.",
    categorySlug: "marketing",
    tags: ["réseaux sociaux", "stratégie", "calendrier"],
    isPremium: true,
    recommendedToolIds: ["tool-chatgpt", "tool-gemini"],
  },

  // ─── ÉTUDES ───
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
];
