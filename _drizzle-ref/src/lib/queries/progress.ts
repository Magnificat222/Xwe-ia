import "server-only";

import { and, desc, eq, sql, count } from "drizzle-orm";
import { db } from "@/db";
import {
  missions,
  missionProgress,
  missionResponses,
  pathways,
  pathwayProgress,
  results,
  notifications,
  favorites,
  profiles,
  goals,
  users,
  challengeAttempts,
  documents,
} from "@/db/schema";

/** Progression de l'utilisateur sur tous ses parcours en cours. */
export async function getUserPathways(userId: string) {
  const rows = await db
    .select({ progress: pathwayProgress, pathway: pathways })
    .from(pathwayProgress)
    .innerJoin(pathways, eq(pathwayProgress.pathwayId, pathways.id))
    .where(eq(pathwayProgress.userId, userId))
    .orderBy(desc(pathwayProgress.lastActivityAt));
  return rows.map((r) => ({ ...r.progress, pathway: r.pathway }));
}

export async function getPathwayProgress(userId: string, pathwayId: string) {
  const rows = await db
    .select()
    .from(pathwayProgress)
    .where(and(eq(pathwayProgress.userId, userId), eq(pathwayProgress.pathwayId, pathwayId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getMissionStatuses(userId: string, pathwayId: string) {
  const rows = await db
    .select({ missionId: missionProgress.missionId, status: missionProgress.status })
    .from(missionProgress)
    .where(and(eq(missionProgress.userId, userId), eq(missionProgress.pathwayId, pathwayId)));
  return new Map(rows.map((r) => [r.missionId, r.status]));
}

export async function getMissionResponse(userId: string, missionId: string) {
  const rows = await db
    .select()
    .from(missionResponses)
    .where(and(eq(missionResponses.userId, userId), eq(missionResponses.missionId, missionId)))
    .limit(1);
  return rows[0] ?? null;
}

/** La prochaine action à proposer sur le tableau de bord. */
export async function getNextMission(userId: string) {
  const active = await db
    .select({ progress: pathwayProgress, pathway: pathways })
    .from(pathwayProgress)
    .innerJoin(pathways, eq(pathwayProgress.pathwayId, pathways.id))
    .where(and(eq(pathwayProgress.userId, userId), eq(pathwayProgress.status, "in_progress")))
    .orderBy(desc(pathwayProgress.lastActivityAt))
    .limit(1);

  if (!active[0]) return null;

  const done = await db
    .select({ missionId: missionProgress.missionId })
    .from(missionProgress)
    .where(
      and(
        eq(missionProgress.userId, userId),
        eq(missionProgress.pathwayId, active[0].pathway.id),
        eq(missionProgress.status, "completed"),
      ),
    );
  const doneIds = new Set(done.map((d) => d.missionId));

  const all = await db
    .select()
    .from(missions)
    .where(and(eq(missions.pathwayId, active[0].pathway.id), eq(missions.isPublished, true)))
    .orderBy(missions.position);

  const next = all.find((m) => !doneIds.has(m.id)) ?? null;
  return next ? { mission: next, pathway: active[0].pathway, progress: active[0].progress } : null;
}

export async function getUserResults(userId: string, limit = 50) {
  const rows = await db
    .select({ result: results, pathway: pathways })
    .from(results)
    .leftJoin(pathways, eq(results.pathwayId, pathways.id))
    .where(eq(results.userId, userId))
    .orderBy(desc(results.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r.result, pathway: r.pathway }));
}

export async function getUserDocuments(userId: string) {
  return db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
}

export async function getNotifications(userId: string, limit = 30) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount(userId: string) {
  const rows = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), sql`${notifications.readAt} is null`));
  return rows[0]?.value ?? 0;
}

export async function getFavorites(userId: string) {
  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function getProfile(userId: string) {
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function getCurrentGoal(userId: string) {
  const profile = await getProfile(userId);
  if (!profile?.currentGoalId) return null;
  const rows = await db.select().from(goals).where(eq(goals.id, profile.currentGoalId)).limit(1);
  return rows[0] ?? null;
}

/** Chiffres agrégés du tableau de bord, en une seule passe. */
export async function getDashboardStats(userId: string) {
  const [missionsDone, pathwaysDone, resultCount, arenaPoints] = await Promise.all([
    db
      .select({ value: count() })
      .from(missionProgress)
      .where(and(eq(missionProgress.userId, userId), eq(missionProgress.status, "completed"))),
    db
      .select({ value: count() })
      .from(pathwayProgress)
      .where(and(eq(pathwayProgress.userId, userId), eq(pathwayProgress.status, "completed"))),
    db.select({ value: count() }).from(results).where(eq(results.userId, userId)),
    db
      .select({ value: sql<number>`coalesce(sum(${challengeAttempts.score}), 0)`.mapWith(Number) })
      .from(challengeAttempts)
      .where(eq(challengeAttempts.userId, userId)),
  ]);

  return {
    missionsCompleted: missionsDone[0]?.value ?? 0,
    pathwaysCompleted: pathwaysDone[0]?.value ?? 0,
    results: resultCount[0]?.value ?? 0,
    arenaPoints: arenaPoints[0]?.value ?? 0,
  };
}

/** Statistiques publiques de la page d'accueil. */
export async function getPublicStats() {
  try {
    const [userCount, pathwayCount, missionCount, resultCount] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(pathways).where(eq(pathways.isPublished, true)),
      db.select({ value: count() }).from(missions).where(eq(missions.isPublished, true)),
      db.select({ value: count() }).from(results),
    ]);
    return {
      users: userCount[0]?.value ?? 0,
      pathways: pathwayCount[0]?.value ?? 0,
      missions: missionCount[0]?.value ?? 0,
      results: resultCount[0]?.value ?? 0,
    };
  } catch {
    return { users: 0, pathways: 0, missions: 0, results: 0 };
  }
}
