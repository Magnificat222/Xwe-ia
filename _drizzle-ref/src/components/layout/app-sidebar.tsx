"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, LogOut, Crown } from "lucide-react";
import { Logo } from "./brand";
import { Lisere, Avatar } from "@/components/ui/misc";
import { primaryNav, secondaryNav, accountNav, type NavLink } from "./app-nav";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/tableau-de-bord") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ link, active }: { link: NavLink; active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active ? "text-ivoire" : "text-ivoire-dim hover:bg-ivoire/5 hover:text-ivoire",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 -z-10 rounded-xl bg-braise/14"
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-braise" />
      )}
      <link.icon size={18} strokeWidth={1.6} className={active ? "text-or" : ""} />
      <span className="truncate">{link.label}</span>
    </Link>
  );
}

export function AppSidebar({
  user,
}: {
  user: { name: string | null; email: string; role: string; plan: string; avatarUrl: string | null };
}) {
  const pathname = usePathname() ?? "";
  const isStaff = user.role !== "user";

  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-ivoire/8 bg-noir lg:flex">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <Lisere className="mx-5 mb-3" />

      <nav aria-label="Navigation" className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div className="space-y-0.5">
          {primaryNav.map((link) => (
            <NavItem key={link.href} link={link} active={isActive(pathname, link.href)} />
          ))}
        </div>

        <div>
          <p className="px-3 pb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ivoire-faint">
            Explorer
          </p>
          <div className="space-y-0.5">
            {secondaryNav.map((link) => (
              <NavItem key={link.href} link={link} active={isActive(pathname, link.href)} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 pb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ivoire-faint">
            Mon compte
          </p>
          <div className="space-y-0.5">
            {accountNav.map((link) => (
              <NavItem key={link.href} link={link} active={isActive(pathname, link.href)} />
            ))}
          </div>
        </div>

        {isStaff && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl border border-or/25 bg-or/8 px-3 py-2.5 text-sm text-or transition-colors hover:bg-or/14"
          >
            <ShieldCheck size={18} strokeWidth={1.6} />
            Administration
          </Link>
        )}
      </nav>

      <div className="border-t border-ivoire/8 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2">
          <Avatar name={user.name} src={user.avatarUrl} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ivoire">{user.name ?? "Membre"}</p>
            <p className="flex items-center gap-1 truncate text-xs text-ivoire-faint">
              {user.plan === "premium" ? (
                <>
                  <Crown size={11} className="text-or" /> Premium
                </>
              ) : (
                "Compte gratuit"
              )}
            </p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivoire-dim transition-colors hover:bg-erreur/10 hover:text-erreur"
          >
            <LogOut size={18} strokeWidth={1.6} /> Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
