import "server-only";

import { and, eq, or, isNull, gt } from "drizzle-orm";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import type { AccessType } from "@/db/schema";
import type { SessionUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/guards";

export type AccessDecision =
  | { allowed: true; reason: "free" | "premium" | "purchased" | "staff" }
  | { allowed: false; reason: "anonymous" | "needs_purchase" | "needs_premium"; priceXof?: number };

/**
 * Point unique de décision d'accès à une ressource protégée.
 * Toute page ou action qui ouvre un contenu payant DOIT passer par ici.
 */
export async function resolveAccess(
  user: SessionUser | null,
  resource: { id: string; accessType: AccessType; priceXof?: number },
): Promise<AccessDecision> {
  if (resource.accessType === "free") return { allowed: true, reason: "free" };

  if (!user) return { allowed: false, reason: "anonymous", priceXof: resource.priceXof };

  // Le personnel voit tout — nécessaire pour la modération et le support.
  if (hasRole(user, "moderator")) return { allowed: true, reason: "staff" };

  // Premium ouvre l'ensemble du catalogue.
  if (user.plan === "premium") return { allowed: true, reason: "premium" };

  if (resource.accessType === "premium") {
    return { allowed: false, reason: "needs_premium", priceXof: resource.priceXof };
  }

  // Parcours à l'unité : un achat non expiré suffit.
  const owned = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, user.id),
        eq(purchases.pathwayId, resource.id),
        or(isNull(purchases.expiresAt), gt(purchases.expiresAt, new Date())),
      ),
    )
    .limit(1);

  if (owned.length > 0) return { allowed: true, reason: "purchased" };

  return { allowed: false, reason: "needs_purchase", priceXof: resource.priceXof };
}

/** Renvoie les identifiants de parcours possédés par l'utilisateur. */
export async function getOwnedPathwayIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ pathwayId: purchases.pathwayId })
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, userId),
        or(isNull(purchases.expiresAt), gt(purchases.expiresAt, new Date())),
      ),
    );
  return new Set(rows.map((r) => r.pathwayId).filter(Boolean) as string[]);
}

export const ACCESS_MESSAGES: Record<string, string> = {
  anonymous: "Crée ton compte pour accéder à ce parcours.",
  needs_purchase: "Ce parcours est disponible à l'achat unique.",
  needs_premium: "Ce parcours est inclus dans l'abonnement Premium.",
};
