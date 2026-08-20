"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { dashboardNavLinks } from "@/components/dashboard/nav-links";
import { SignOutButton } from "@/components/shared/sign-out-button";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ivoire/15 text-ivoire-dim"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-noir/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-noir-soft p-6">
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="font-display text-lg text-ivoire"
              >
                Xwé <span className="text-or">IA</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ivoire-dim hover:text-ivoire"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {dashboardNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ivoire-dim transition-colors hover:bg-ivoire/5 hover:text-ivoire"
                >
                  <link.icon size={18} strokeWidth={1.5} />
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-or transition-colors hover:bg-or/10"
                >
                  <ShieldCheck size={18} strokeWidth={1.5} />
                  Administration
                </Link>
              )}
              <div className="mt-2 border-t border-ivoire/10 pt-2">
                <SignOutButton />
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
