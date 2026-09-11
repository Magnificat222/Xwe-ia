import {
  Brain,
  Briefcase,
  BriefcaseBusiness,
  Compass,
  FileUser,
  FileText,
  Folder,
  GraduationCap,
  KanbanSquare,
  Lightbulb,
  Megaphone,
  Palette,
  PenLine,
  Presentation,
  Rocket,
  Route,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Registre d'icônes administrables.
 *
 * Les objectifs, catégories et jeux stockent un *nom* d'icône en base. Faire
 * `import * as Icons from "lucide-react"` pour le résoudre embarque toute la
 * bibliothèque dans le bundle client (plus de 170 ko). Ce registre explicite
 * laisse le tree-shaking opérer : seules ces icônes sont livrées.
 *
 * Pour rendre une nouvelle icône disponible côté administration, il suffit de
 * l'ajouter ici.
 */
export const ICONS = {
  Brain,
  Briefcase,
  BriefcaseBusiness,
  Compass,
  FileUser,
  FileText,
  Folder,
  GraduationCap,
  KanbanSquare,
  Lightbulb,
  Megaphone,
  Palette,
  PenLine,
  Presentation,
  Rocket,
  Route,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wrench,
  Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/** Résout un nom d'icône stocké en base, avec repli sûr. */
export function resolveIcon(name: string | null | undefined, fallback: LucideIcon = Target): LucideIcon {
  if (!name) return fallback;
  return ICONS[name as IconName] ?? fallback;
}

/** Noms disponibles, pour les listes déroulantes de l'administration. */
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
