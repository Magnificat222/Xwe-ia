import "server-only";

import { desc, eq, sql, and, count } from "drizzle-orm";
import { db } from "@/db";
import { games, challenges, challengeAttempts, users, profiles } from "@/db/schema";

export async function getGames() {
  return db.select().from(games).where(eq(games.isPublished, true)).orderBy(games.position);
}

export async function getGameWithChallenges(slug: string) {
  const rows = await db.select().from(games).where(eq(games.slug, slug)).limit(1);
  if (!rows[0]) return null;

  const challengeRows = await db
    .select()
    .from(challenges)
    .where(and(eq(challenges.gameId, rows[0].id), eq(challenges.isPublished, true)))
    .orderBy(challenges.position);

  return { ...rows[0], challenges: challengeRows };
}

export async function getChallenge(id: string) {
  const rows = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Classement global : somme des points de tous les défis. */
export async function getLeaderboard(limit = 20) {
  const rows = await db
    .select({
      userId: challengeAttempts.userId,
      points: sql<number>`sum(${challengeAttempts.score})`.mapWith(Number),
      attempts: count(),
      name: users.name,
      avatarUrl: users.avatarUrl,
      displayName: profiles.displayName,
    })
    .from(challengeAttempts)
    .innerJoin(users, eq(challengeAttempts.userId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .groupBy(challengeAttempts.userId, users.name, users.avatarUrl, profiles.displayName)
    .orderBy(desc(sql`sum(${challengeAttempts.score})`))
    .limit(limit);

  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    name: row.displayName ?? row.name ?? "Membre",
    avatarUrl: row.avatarUrl,
    points: row.points,
    attempts: row.attempts,
  }));
}

export async function getUserArenaStats(userId: string) {
  const rows = await db
    .select({
      points: sql<number>`coalesce(sum(${challengeAttempts.score}), 0)`.mapWith(Number),
      attempts: count(),
      best: sql<number>`coalesce(max(${challengeAttempts.score}), 0)`.mapWith(Number),
    })
    .from(challengeAttempts)
    .where(eq(challengeAttempts.userId, userId));

  const board = await getLeaderboard(100);
  const rank = board.find((entry) => entry.userId === userId)?.rank ?? null;

  return {
    points: rows[0]?.points ?? 0,
    attempts: rows[0]?.attempts ?? 0,
    best: rows[0]?.best ?? 0,
    rank,
  };
}

export async function getUserAttempts(userId: string, limit = 10) {
  const rows = await db
    .select({ attempt: challengeAttempts, challenge: challenges, game: games })
    .from(challengeAttempts)
    .innerJoin(challenges, eq(challengeAttempts.challengeId, challenges.id))
    .innerJoin(games, eq(challenges.gameId, games.id))
    .where(eq(challengeAttempts.userId, userId))
    .orderBy(desc(challengeAttempts.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r.attempt, challenge: r.challenge, game: r.game }));
}
