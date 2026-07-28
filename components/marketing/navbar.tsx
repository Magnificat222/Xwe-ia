"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LayoutDashboard } from "lucide-react";

const links = [
  { href: "#missions", label: "Missions" },
  { href: "#parcours", label: "Parcours" },
  { href: "#outils", label: "Outils IA" },
  { href: "#tarifs", label: "Tarifs" },
];

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-ivoire/10 bg-noir/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-tight text-ivoire">
          Xwé <span className="text-or">IA</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ivoire-dim transition-colors hover:text-ivoire"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {status === "authenticated" && session?.user ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                <LayoutDashboard size={15} /> Tableau de bord
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">Commencer</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
