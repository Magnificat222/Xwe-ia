"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ivoire-dim transition-colors hover:bg-ivoire/5 hover:text-ivoire"
      }
    >
      <LogOut size={18} strokeWidth={1.5} />
      Déconnexion
    </button>
  );
}
