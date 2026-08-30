"use client";

import { useTransition } from "react";
import { setUserPlan } from "@/lib/actions/users";

export function PlanSelect({ userId, currentPlan }: { userId: string; currentPlan: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={currentPlan}
      disabled={isPending}
      onChange={(e) => {
        const plan = e.target.value as "FREE" | "PREMIUM";
        startTransition(() => setUserPlan(userId, plan));
      }}
      className="rounded-lg border border-ivoire/15 bg-noir px-2 py-1 text-xs text-ivoire outline-none focus:border-or"
    >
      <option value="FREE">Gratuit</option>
      <option value="PREMIUM">Premium</option>
    </select>
  );
}
