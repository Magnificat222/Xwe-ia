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
  },
  {
    id: "pr-personal-branding",
    title: "Ligne éditoriale personal branding",
    content:
      "Tu es stratège en contenu. À partir de [expertise] et [audience cible], propose 3 formats de contenu récurrents et 10 idées de sujets pour un mois.",
    categorySlug: "marketing",
    tags: ["réseaux sociaux", "contenu"],
    isPremium: false,
  },
  {
    id: "pr-soutenance",
    title: "Questions probables du jury",
    content:
      "Tu es membre d'un jury exigeant. À partir de ce résumé de mémoire [résumé], génère 8 questions probables classées par difficulté, avec des pistes de réponse.",
    categorySlug: "etudes",
    tags: ["soutenance", "mémoire"],
    isPremium: true,
  },
];
