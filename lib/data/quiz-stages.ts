export type QuizStageData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  topic: string;
  level: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  order: number;
  questionCount: number;
  isPremium: boolean;
};

export const quizStages: QuizStageData[] = [
  {
    id: "qs-bases-ia",
    slug: "les-bases-de-lia",
    title: "Les bases de l'IA",
    description: "Vocabulaire essentiel, grands concepts, et idées reçues sur l'intelligence artificielle.",
    topic: "les concepts fondamentaux de l'intelligence artificielle et de l'IA générative pour un grand public",
    level: "DEBUTANT",
    order: 1,
    questionCount: 10,
    isPremium: false,
  },
  {
    id: "qs-prompt-engineering",
    slug: "maitriser-le-prompt-engineering",
    title: "Maîtriser le prompt engineering",
    description: "Structurer une bonne instruction, éviter les pièges classiques, obtenir de meilleures réponses.",
    topic: "les bonnes pratiques de prompt engineering pour bien utiliser les IA génératives",
    level: "INTERMEDIAIRE",
    order: 2,
    questionCount: 10,
    isPremium: false,
  },
  {
    id: "qs-ia-business",
    slug: "ia-et-strategie-business",
    title: "IA et stratégie business",
    description: "Comment l'IA transforme le business model, le marketing et la prise de décision en entreprise.",
    topic: "l'utilisation stratégique de l'IA en entreprise : business model, marketing, productivité",
    level: "INTERMEDIAIRE",
    order: 3,
    questionCount: 10,
    isPremium: false,
  },
  {
    id: "qs-ia-avance",
    slug: "concepts-avances-de-lia",
    title: "Concepts avancés de l'IA",
    description: "Agents autonomes, prompt chaining, limites et enjeux éthiques des modèles avancés.",
    topic: "les concepts avancés de l'IA générative : agents autonomes, prompt chaining, limites et éthique",
    level: "AVANCE",
    order: 4,
    questionCount: 10,
    isPremium: false,
  },
];
