import {
  LayoutDashboard,
  Target,
  Route,
  Trophy,
  MessageSquare,
  Swords,
  Wrench,
  Star,
  Bell,
  User,
  Settings,
  Crown,
  Receipt,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  short?: string;
  icon: LucideIcon;
}

/** Navigation principale — les 5 premiers alimentent la barre d'onglets mobile. */
export const primaryNav: NavLink[] = [
  { href: "/tableau-de-bord", label: "Tableau de bord", short: "Accueil", icon: LayoutDashboard },
  { href: "/parcours", label: "Parcours", icon: Route },
  { href: "/resultats", label: "Mes résultats", short: "Résultats", icon: Trophy },
  { href: "/discussion", label: "Discussion", icon: MessageSquare },
  { href: "/arene", label: "Arène", icon: Swords },
];

export const secondaryNav: NavLink[] = [
  { href: "/objectifs", label: "Objectifs", icon: Target },
  { href: "/outils", label: "Outils IA", icon: Wrench },
  { href: "/favoris", label: "Favoris", icon: Star },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export const accountNav: NavLink[] = [
  { href: "/profil", label: "Profil", icon: User },
  { href: "/premium", label: "Premium", icon: Crown },
  { href: "/achats", label: "Mes achats", icon: Receipt },
  { href: "/parametres", label: "Paramètres", icon: Settings },
  { href: "/support", label: "Support", icon: LifeBuoy },
];
