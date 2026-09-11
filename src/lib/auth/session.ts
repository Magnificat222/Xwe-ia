import "server-only";

import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, profiles, subscriptions } from "@/db/schema";
import type { Role } from "@/db/schema";

export const SESSION_COOKIE = "xwe_session";
const SESSION_DAYS = 30;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Crée une session : le token en clair part dans le cookie, seul son hash
 * est stocké. Une fuite de la base ne permet donc pas d'usurper une session.
 */
export async function createSession(userId: string, meta?: { userAgent?: string; ip?: string }) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    userAgent: meta?.userAgent?.slice(0, 300),
    ip: meta?.ip?.slice(0, 60),
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  store.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: Role;
  emailVerified: boolean;
  onboarded: boolean;
  plan: "free" | "premium";
  premiumUntil: Date | null;
  displayName: string | null;
}

/**
 * Lit la session courante. Le rôle et le plan viennent TOUJOURS de la base,
 * jamais du cookie : une rétrogradation prend effet immédiatement.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const rows = await db
      .select({
        user: users,
        profile: profiles,
        subscription: subscriptions,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, hashToken(token)),
          gt(sessions.expiresAt, new Date()),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row || row.user.isBanned) return null;

    const sub = row.subscription;
    const stillActive =
      sub?.plan === "premium" &&
      sub.status === "active" &&
      (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());

    return {
      id: row.user.id,
      email: row.user.email,
      name: row.user.name,
      avatarUrl: row.user.avatarUrl,
      role: row.user.role,
      emailVerified: Boolean(row.user.emailVerifiedAt),
      onboarded: Boolean(row.user.onboardedAt),
      plan: stillActive ? "premium" : "free",
      premiumUntil: sub?.currentPeriodEnd ?? null,
      displayName: row.profile?.displayName ?? row.user.name,
    };
  } catch {
    // Base indisponible ou schéma pas encore migré : on considère l'utilisateur
    // déconnecté plutôt que de faire tomber toute l'application.
    return null;
  }
}
