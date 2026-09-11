"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Logo } from "./brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/objectifs", label: "Objectifs" },
  { href: "/parcours", label: "Parcours" },
  { href: "/outils", label: "Outils IA" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-ivoire/10 bg-noir/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <Logo />

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm text-ivoire-dim transition-colors hover:text-ivoire after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-or after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link href="/tableau-de-bord" className="hidden sm:block">
              <Button variant="secondary" size="sm" icon={<LayoutDashboard size={15} />}>
                Mon espace
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link href="/inscription" className="hidden sm:block">
                <Button size="sm">Commencer</Button>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-ivoire/15 text-ivoire-dim transition-colors hover:border-or/40 hover:text-or lg:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-noir/85 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              aria-label="Menu mobile"
              className="absolute right-0 top-0 flex h-full w-[85vw] max-w-xs flex-col bg-noir-soft p-6 shadow-2xl"
              initial={reduce ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo size={28} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-ivoire-dim hover:text-ivoire"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-base text-ivoire-dim transition-colors hover:bg-ivoire/5 hover:text-ivoire"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-2.5 border-t border-ivoire/10 pt-5">
                {isAuthenticated ? (
                  <Link href="/tableau-de-bord" onClick={() => setOpen(false)}>
                    <Button fullWidth icon={<LayoutDashboard size={16} />}>
                      Mon espace
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/inscription" onClick={() => setOpen(false)}>
                      <Button fullWidth>Commencer</Button>
                    </Link>
                    <Link href="/connexion" onClick={() => setOpen(false)}>
                      <Button fullWidth variant="secondary">
                        Connexion
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
