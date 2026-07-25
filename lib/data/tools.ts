import type { Tool } from "@/types";

export const tools: Tool[] = [
  {
    id: "tool-chatgpt",
    name: "ChatGPT",
    description: "Assistant conversationnel généraliste pour la rédaction, l'analyse et le brainstorm.",
    useCases: ["Rédaction", "Brainstorm", "Analyse de documents"],
    pricing: "Gratuit / 20$ mois (Plus)",
    features: ["Génération de texte", "Analyse d'image", "Navigation web"],
    url: "https://chat.openai.com",
  },
  {
    id: "tool-notion-ai",
    name: "Notion AI",
    description: "IA intégrée à Notion pour organiser notes, projets et documentation.",
    useCases: ["Prise de notes", "Résumés", "Organisation de projet"],
    pricing: "Ajout payant à un espace Notion",
    features: ["Résumé automatique", "Génération de plans", "Traduction"],
    url: "https://www.notion.so/product/ai",
  },
  {
    id: "tool-heygen",
    name: "HeyGen",
    description: "Génération de vidéos avec avatars IA, utile pour présentations et pitchs.",
    useCases: ["Vidéos de présentation", "Pitchs", "Contenu formation"],
    pricing: "Gratuit limité / à partir de 24$ mois",
    features: ["Avatars personnalisés", "Voix IA multilingue", "Sous-titres automatiques"],
    url: "https://www.heygen.com",
  },
];
