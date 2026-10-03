import type { Category } from "@/types";

export const categories: Category[] = [
  { id: "cat-business", slug: "business", name: "Business", description: "Plans, pitchs, modèles économiques", icon: "Briefcase" },
  { id: "cat-marketing", slug: "marketing", name: "Marketing", description: "Acquisition, contenu, réseaux sociaux", icon: "Megaphone" },
  { id: "cat-etudes", slug: "etudes", name: "Études", description: "Soutenances, mémoires, révisions", icon: "GraduationCap" },
  { id: "cat-creation", slug: "creation", name: "Création", description: "Identité visuelle, contenu créatif", icon: "Palette" },
  { id: "cat-productivite", slug: "productivite", name: "Productivité", description: "Organisation, routines, priorisation", icon: "CheckCircle2" },
  { id: "cat-developpement", slug: "developpement", name: "Développement", description: "Projets techniques, code, produit", icon: "Code2" },
  { id: "cat-ia", slug: "ia", name: "IA", description: "Prompt engineering, outils, usages", icon: "Sparkles" },
  { id: "cat-automatisation", slug: "automatisation", name: "Automatisation", description: "Workflows et tâches automatisées", icon: "Workflow" },
  { id: "cat-gestion-de-projet", slug: "gestion-de-projet", name: "Gestion de projet", description: "Planification et pilotage", icon: "KanbanSquare" },
];
