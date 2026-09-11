"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Target,
  Route,
  ListChecks,
  FolderTree,
  Wrench,
  BookOpen,
  MessageSquare,
  Flag,
  Swords,
  CreditCard,
  Crown,
  Bell,
  Scale,
  LifeBuoy,
  Settings,
  ScrollText,
  Receipt,
  TicketPercent,
  Tag,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Rôle minimum requis pour voir l'entrée. */
  minimum?: "moderator" | "admin";
}

const GROUPS: { title: string; links: AdminLink[] }[] = [
  {
    title: "Pilotage",
    links: [
      { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
      { href: "/admin/statistiques", label: "Statistiques", icon: ScrollText, minimum: "admin" },
      { href: "/admin/commerce", label: "Tableau commercial", icon: TrendingUp, minimum: "admin" },
    ],
  },
  {
    title: "Contenu",
    links: [
      { href: "/admin/objectifs", label: "Objectifs", icon: Target, minimum: "admin" },
      { href: "/admin/parcours", label: "Parcours", icon: Route, minimum: "admin" },
      { href: "/admin/missions", label: "Missions", icon: ListChecks, minimum: "admin" },
      { href: "/admin/categories", label: "Catégories", icon: FolderTree, minimum: "admin" },
      { href: "/admin/outils", label: "Outils", icon: Wrench, minimum: "admin" },
      { href: "/admin/ressources", label: "Ressources", icon: BookOpen, minimum: "admin" },
      { href: "/admin/arene", label: "Arène", icon: Swords, minimum: "admin" },
    ],
  },
  {
    title: "Communauté",
    links: [
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
      { href: "/admin/discussion", label: "Discussion", icon: MessageSquare },
      { href: "/admin/signalements", label: "Signalements", icon: Flag },
      { href: "/admin/support", label: "Support", icon: LifeBuoy },
      { href: "/admin/notifications", label: "Notifications", icon: Bell, minimum: "admin" },
    ],
  },
  {
    title: "Monétisation",
    links: [
      { href: "/admin/commandes", label: "Commandes", icon: Receipt, minimum: "admin" },
      { href: "/admin/paiements", label: "Paiements", icon: CreditCard, minimum: "admin" },
      { href: "/admin/prix", label: "Prix", icon: Tag, minimum: "admin" },
      { href: "/admin/promotions", label: "Promotions", icon: TicketPercent, minimum: "admin" },
      { href: "/admin/premium", label: "Abonnements", icon: Crown, minimum: "admin" },
    ],
  },
  {
    title: "Plateforme",
    links: [
      { href: "/admin/legal", label: "Pages légales", icon: Scale, minimum: "admin" },
      { href: "/admin/ia", label: "Intelligence artificielle", icon: Sparkles, minimum: "admin" },
      { href: "/admin/parametres", label: "Paramètres", icon: Settings, minimum: "admin" },
    ],
  },
];

const WEIGHT = { user: 0, moderator: 1, admin: 2, super_admin: 3 } as const;

export function AdminNav({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  const weight = WEIGHT[role as keyof typeof WEIGHT] ?? 0;

  return (
    <nav aria-label="Navigation de l'administration" className="space-y-6">
      {GROUPS.map((group) => {
        const visible = group.links.filter(
          (link) => !link.minimum || weight >= WEIGHT[link.minimum],
        );
        if (visible.length === 0) return null;

        return (
          <div key={group.title}>
            <p className="mb-2 px-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ivoire-faint">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {visible.map((link) => {
                const active =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-braise/14 text-ivoire"
                          : "text-ivoire-dim hover:bg-ivoire/5 hover:text-ivoire",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-braise" />
                      )}
                      <link.icon
                        size={16}
                        strokeWidth={1.6}
                        className={active ? "text-or" : ""}
                      />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
