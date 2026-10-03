// Domain types for Xwé IA
// Mirrors the Prisma schema (prisma/schema.prisma) but kept framework-agnostic
// so it can be reused in server components, client components, and services.

export type MissionLevel = "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";

export type MissionCategorySlug =
  | "business"
  | "marketing"
  | "etudes"
  | "creation"
  | "productivite"
  | "developpement"
  | "ia"
  | "automatisation"
  | "gestion-de-projet";

export interface Category {
  id: string;
  slug: MissionCategorySlug;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
}

export interface MissionStep {
  id: string;
  title: string;
  content: string;
  promptId?: string;
}

export interface Mission {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: MissionCategorySlug;
  level: MissionLevel;
  estimatedMinutes: number;
  recommendedTools: string[]; // Tool ids
  steps: MissionStep[];
  tips: string[];
  commonMistakes: string[];
  checklist: string[];
  isPremium: boolean;
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  missionIds: string[];
  isPremium: boolean;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  categorySlug: MissionCategorySlug;
  tags: string[];
  isPremium: boolean;
  recommendedToolIds: string[]; // Tool ids most effective for this prompt
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  useCases: string[];
  pricing: string;
  features: string[];
  url: string;
  howToUse: string[]; // short step-by-step usage guide
}

export type SubscriptionPlan = "FREE" | "PREMIUM";

export interface UserProgress {
  completedMissionIds: string[];
  badges: string[];
  completionRate: number; // 0-100
}
