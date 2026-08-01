import {
  LayoutDashboard,
  Target,
  Route,
  Library,
  Wrench,
  Star,
  User,
  MessageCircleHeart,
  BookOpen,
  Swords,
} from "lucide-react";

export const dashboardNavLinks = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/missions", label: "Missions", icon: Target },
  { href: "/parcours", label: "Parcours", icon: Route },
  { href: "/prompts", label: "Prompts", icon: Library },
  { href: "/quiz", label: "Arène de quiz", icon: Swords },
  { href: "/ebooks", label: "Ebooks", icon: BookOpen },
  { href: "/toolbox", label: "Outils IA", icon: Wrench },
  { href: "/favoris", label: "Favoris", icon: Star },
  { href: "/support", label: "Support Premium", icon: MessageCircleHeart },
  { href: "/profile", label: "Profil", icon: User },
];
