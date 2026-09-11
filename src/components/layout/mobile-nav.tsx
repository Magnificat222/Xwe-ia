"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, ShieldCheck, LogOut, Crown, Bell } from "lucide-react";
import { Logo } from "./brand";
import { Avatar } from "@/components/ui/misc";
import { primaryNav, secondaryNav, accountNav } from "./app-nav";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/tableau-de-bord") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Barre d'onglets basse — la navigation principale sur mobile.
 * Ce n'est pas la version desktop réduite : les 5 destinations les plus
 * utilisées sont à portée de pouce, le reste passe par le tiroir.
 */
export function MobileTabBar({ unread }: { unread: number }) {
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label="Navigation principale"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-ivoire/10 bg-noir/95 backdrop-blur-xl lg:hidden"
    >
      <ul className="flex items-stretch">
        {primaryNav.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 text-[0.62rem] transition-colors",
                  active ? "text-or" : "text-ivoire-faint",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-active"
                    className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-or"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">
                  <link.icon size={19} strokeWidth={active ? 2 : 1.6} />
                  {link.href === "/notifications" && unread > 0 && (
                    <span className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-braise" />
                  )}
                </span>
                <span className="truncate">{link.short ?? link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Tiroir secondaire : tout ce qui ne tient pas dans la barre d'onglets. */
export function MobileDrawer({
  user,
  unread,
}: {
  user: { name: string | null; email: string; role: string; plan: string; avatarUrl: string | null };
  unread: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion();
  const isStaff = user.role !== "user";

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const groups = [
    { title: "Explorer", links: secondaryNav },
    { title: "Mon compte", links: accountNav },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-ivoire/15 text-ivoire-dim transition-colors hover:border-or/40 lg:hidden"
      >
        <Menu size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-braise px-1 text-[0.6rem] font-medium text-ivoire">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-noir/85 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute left-0 top-0 flex h-full w-[86vw] max-w-xs flex-col bg-noir-soft shadow-2xl"
              initial={reduce ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between px-5 py-5">
                <Logo size={28} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-ivoire-dim hover:text-ivoire"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="flex items-center gap-3 border-y border-ivoire/8 px-5 py-4">
                <Avatar name={user.name} src={user.avatarUrl} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-ivoire">{user.name ?? "Membre"}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-ivoire-faint">
                    {user.plan === "premium" ? (
                      <>
                        <Crown size={11} className="text-or" /> Premium
                      </>
                    ) : (
                      user.email
                    )}
                  </p>
                </div>
              </div>

              <nav aria-label="Menu" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
                {groups.map((group) => (
                  <div key={group.title}>
                    <p className="px-3 pb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ivoire-faint">
                      {group.title}
                    </p>
                    <div className="space-y-0.5">
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                            isActive(pathname, link.href)
                              ? "bg-braise/12 text-ivoire"
                              : "text-ivoire-dim hover:bg-ivoire/5 hover:text-ivoire",
                          )}
                        >
                          <link.icon size={18} strokeWidth={1.6} />
                          <span className="flex-1">{link.label}</span>
                          {link.href === "/notifications" && unread > 0 && (
                            <span className="rounded-full bg-braise px-1.5 py-0.5 text-[0.62rem] text-ivoire">
                              {unread}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {isStaff && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-xl border border-or/25 bg-or/8 px-3 py-3 text-sm text-or"
                  >
                    <ShieldCheck size={18} strokeWidth={1.6} /> Administration
                  </Link>
                )}
              </nav>

              <form action={logoutAction} className="border-t border-ivoire/8 p-3">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-ivoire-dim transition-colors hover:bg-erreur/10 hover:text-erreur"
                >
                  <LogOut size={18} strokeWidth={1.6} /> Déconnexion
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function NotificationBell({ unread }: { unread: number }) {
  return (
    <Link
      href="/notifications"
      aria-label={`Notifications${unread > 0 ? ` (${unread} non lues)` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-ivoire/15 text-ivoire-dim transition-colors hover:border-or/40 hover:text-or"
    >
      <Bell size={17} />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-braise px-1 text-[0.6rem] font-medium text-ivoire">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
