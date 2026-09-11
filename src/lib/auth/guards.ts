import "server-only";

import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./session";
import type { Role } from "@/db/schema";

const ROLE_WEIGHT: Record<Role, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3,
};

export function hasRole(user: Pick<SessionUser, "role"> | null, minimum: Role): boolean {
  if (!user) return false;
  return ROLE_WEIGHT[user.role] >= ROLE_WEIGHT[minimum];
}

export function isStaff(user: Pick<SessionUser, "role"> | null): boolean {
  return hasRole(user, "moderator");
}

/** Exige un utilisateur connecté, sinon redirige vers la connexion. */
export async function requireUser(callbackUrl?: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const target = callbackUrl ? `/connexion?suite=${encodeURIComponent(callbackUrl)}` : "/connexion";
    redirect(target);
  }
  return session;
}

/** Exige un rôle minimum. Toute page d'administration passe par ici. */
export async function requireRole(minimum: Role, callbackUrl?: string): Promise<SessionUser> {
  const session = await requireUser(callbackUrl);
  if (!hasRole(session, minimum)) redirect("/tableau-de-bord?erreur=acces-refuse");
  return session;
}

/** Variante non redirigeante, pour les route handlers. */
export async function getApiUser(minimum: Role = "user"): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || !hasRole(session, minimum)) return null;
  return session;
}
