"use client";

import { useState, useTransition } from "react";
import { Ban, CheckCircle2, Crown, ShieldCheck, MoreHorizontal } from "lucide-react";

import { useToast } from "@/components/ui/toast";
import {
  setUserRoleAction,
  toggleBanAction,
  grantPremiumAction,
  revokePremiumAction,
} from "@/lib/actions/admin";
import type { Role } from "@/db/schema";
import { cn } from "@/lib/utils";

const ROLES: { value: Role; label: string }[] = [
  { value: "user", label: "Utilisateur" },
  { value: "moderator", label: "Modérateur" },
  { value: "admin", label: "Administrateur" },
  { value: "super_admin", label: "Super administrateur" },
];

export function UserRowActions({
  userId,
  role,
  isBanned,
  isPremium,
  canManageRoles,
}: {
  userId: string;
  role: Role;
  isBanned: boolean;
  isPremium: boolean;
  canManageRoles: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const { push } = useToast();

  const run = (fn: () => Promise<{ error?: string; success?: string }>) =>
    start(async () => {
      const result = await fn();
      if (result.error) push(result.error, "erreur");
      else if (result.success) push(result.success, "succes");
      setOpen(false);
    });

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Actions sur ce compte"
        disabled={pending}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ivoire-dim transition-colors hover:bg-ivoire/8 hover:text-ivoire disabled:opacity-50"
      >
        <MoreHorizontal size={17} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1 w-60 rounded-xl border border-ivoire/12 bg-noir-raised p-1.5 shadow-2xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => run(() => toggleBanAction(userId))}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ivoire-dim transition-colors hover:bg-ivoire/6 hover:text-ivoire"
            >
              {isBanned ? (
                <>
                  <CheckCircle2 size={15} className="text-feuillage-vif" /> Réactiver le compte
                </>
              ) : (
                <>
                  <Ban size={15} className="text-erreur" /> Suspendre le compte
                </>
              )}
            </button>

            {isPremium ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => run(() => revokePremiumAction(userId))}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ivoire-dim transition-colors hover:bg-ivoire/6 hover:text-ivoire"
              >
                <Crown size={15} /> Retirer Premium
              </button>
            ) : (
              [1, 3, 12].map((months) => (
                <button
                  key={months}
                  type="button"
                  role="menuitem"
                  onClick={() => run(() => grantPremiumAction(userId, months))}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ivoire-dim transition-colors hover:bg-ivoire/6 hover:text-ivoire"
                >
                  <Crown size={15} className="text-or" /> Offrir {months} mois de Premium
                </button>
              ))
            )}

            {canManageRoles && (
              <>
                <div className="my-1.5 border-t border-ivoire/8" />
                <p className="px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ivoire-faint">
                  Rôle
                </p>
                {ROLES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitem"
                    disabled={option.value === role}
                    onClick={() => run(() => setUserRoleAction(userId, option.value))}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      option.value === role
                        ? "cursor-default bg-or/8 text-or"
                        : "text-ivoire-dim hover:bg-ivoire/6 hover:text-ivoire",
                    )}
                  >
                    <ShieldCheck size={15} /> {option.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
