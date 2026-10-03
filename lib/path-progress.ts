// Progress inside a LearningPath, derived from the existing Progress table
// (one row per user+mission). A mission shared by two paths counts as done in
// both: completion belongs to the mission, not to the path.
import { prisma } from "@/lib/prisma";

export type PathProgress = {
  total: number;
  completed: number;
  percent: number;
  completedIds: Set<string>;
  nextMission: { id: string; slug: string } | null; // first not-completed, in path order
};

export async function getPathProgress(userId: string, pathId: string): Promise<PathProgress> {
  const items = await prisma.learningPathMission.findMany({
    where: { learningPathId: pathId, mission: { isPublished: true } },
    orderBy: { order: "asc" },
    select: { missionId: true, mission: { select: { id: true, slug: true } } },
  });
  const ids = items.map((i) => i.missionId);
  const done = ids.length
    ? await prisma.progress.findMany({
        where: { userId, missionId: { in: ids }, completed: true },
        select: { missionId: true },
      })
    : [];
  const completedIds = new Set(done.map((d) => d.missionId));
  const next = items.find((i) => !completedIds.has(i.missionId));
  return {
    total: ids.length,
    completed: completedIds.size,
    percent: ids.length ? Math.round((completedIds.size / ids.length) * 100) : 0,
    completedIds,
    nextMission: next ? { id: next.mission.id, slug: next.mission.slug } : null,
  };
}

// Percent per path for a list of paths (one query) — used by the path list.
export async function getProgressPercentByPath(
  userId: string,
  paths: { id: string; missions: { missionId: string }[] }[]
): Promise<Record<string, number>> {
  const allIds = Array.from(new Set(paths.flatMap((p) => p.missions.map((m) => m.missionId))));
  if (allIds.length === 0) return {};
  const done = await prisma.progress.findMany({
    where: { userId, missionId: { in: allIds }, completed: true },
    select: { missionId: true },
  });
  const doneSet = new Set(done.map((d) => d.missionId));
  const result: Record<string, number> = {};
  for (const p of paths) {
    const total = p.missions.length;
    const completed = p.missions.filter((m) => doneSet.has(m.missionId)).length;
    result[p.id] = total ? Math.round((completed / total) * 100) : 0;
  }
  return result;
}
