import {
  LayoutDashboard,
  Target,
  Route,
  Library,
  Wrench,
  Star,
  User,
  MessageSquare,
  BookOpen,
  Swords,
  FolderKanban,
} from "lucide-react";

export const dashboardNavLinks = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/parcours", label: "Parcours", icon: Route },
  { href: "/projets", label: "Projets guidés", icon: FolderKanban },
  { href: "/missions", label: "Missions", icon: Target },
  { href: "/quiz", label: "Arène de quiz", icon: Swords },
  { href: "/support", label: "Discussion", icon: MessageSquare },
  { href: "/toolbox", label: "Outils IA", icon: Wrench },
  { href: "/ebooks", label: "Ebooks", icon: BookOpen },
  { href: "/prompts", label: "Prompts", icon: Library },
  { href: "/favoris", label: "Favoris", icon: Star },
  { href: "/profile", label: "Profil", icon: User },
];
