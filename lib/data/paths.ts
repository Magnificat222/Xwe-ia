import type { LearningPath } from "@/types";

export const learningPaths: LearningPath[] = [
  {
    id: "p-entreprendre",
    slug: "lancer-son-entreprise-avec-lia",
    title: "Lancer son entreprise avec l'IA",
    description: "De l'idée validée au premier client, avec l'IA comme copilote à chaque étape.",
    missionIds: ["m-business-plan", "m-lancer-entreprise"],
    isPremium: true,
  },
  {
    id: "p-soutenance",
    slug: "reussir-sa-soutenance",
    title: "Réussir sa soutenance",
    description: "Une préparation complète, du plan à la gestion du stress le jour J.",
    missionIds: ["m-soutenance"],
    isPremium: false,
  },
  {
    id: "p-createur",
    slug: "devenir-createur-de-contenu",
    title: "Devenir créateur de contenu",
    description: "Positionnement, ligne éditoriale et régularité pour construire une audience.",
    missionIds: ["m-personal-branding"],
    isPremium: false,
  },
];
