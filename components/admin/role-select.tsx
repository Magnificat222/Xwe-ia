"use client";

import { useTransition } from "react";
import { setUserRole } from "@/lib/actions/users";

export function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={currentRole}
      disabled={isPending}
      onChange={(e) => {
        const role = e.target.value as "USER" | "MODERATOR" | "ADMIN";
        if (!confirm(`Changer le rôle en "${role}" ?`)) return;
        startTransition(() => setUserRole(userId, role));
      }}
      className="rounded-lg border border-ivoire/15 bg-noir px-2 py-1 text-xs text-ivoire outline-none focus:border-or"
    >
      <option value="USER">Utilisateur</option>
      <option value="MODERATOR">Modérateur</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}
