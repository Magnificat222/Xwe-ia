"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/brand";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "./admin-nav";

const ROLE_LABELS: Record<string, string> = {
  moderator: "Modérateur",
  admin: "Administrateur",
  super_admin: "Super admin",
};

export function AdminShell({
  role,
  email,
  children,
}: {
  role: string;
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-screen bg-noir">
      {/* Barre latérale desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ivoire/8 bg-noir-soft/50 px-3 py-5 lg:flex">
        <div className="mb-6 px-2">
          <Logo href="/admin" size={28} />
          <Badge tone="braise" className="mt-3">
            <ShieldCheck size={11} /> {ROLE_LABELS[role] ?? role}
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AdminNav role={role} />
        </div>

        <div className="mt-4 border-t border-ivoire/8 px-3 pt-4">
          <p className="truncate text-xs text-ivoire-faint">{email}</p>
          <Link
            href="/tableau-de-bord"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-ivoire-dim transition-colors hover:text-or"
          >
            <ArrowLeft size={13} /> Retour à l'application
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ivoire/8 bg-noir/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu d'administration"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ivoire-dim transition-colors hover:bg-ivoire/8 hover:text-ivoire"
          >
            <Menu size={19} />
          </button>
          <Logo href="/admin" size={26} />
          <Badge tone="braise">Admin</Badge>
        </header>

        <main id="contenu" className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-noir/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={reduce ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-ivoire/10 bg-noir-elevated px-3 py-5"
            >
              <div className="mb-6 flex items-center justify-between px-2">
                <Logo href="/admin" size={26} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ivoire-dim hover:bg-ivoire/8"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AdminNav role={role} onNavigate={() => setOpen(false)} />
              </div>
              <Link
                href="/tableau-de-bord"
                className="mt-4 inline-flex items-center gap-1.5 border-t border-ivoire/8 px-3 pt-4 text-xs text-ivoire-dim hover:text-or"
              >
                <ArrowLeft size={13} /> Retour à l'application
              </Link>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
