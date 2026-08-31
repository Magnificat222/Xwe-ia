import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ArrowRight, FolderKanban } from "lucide-react";

// "Mes projets" reuses real data already in the schema — a parcours
// (LearningPath) grouping missions, and each user's Progress on those
// missions. Nothing here is mocked: the percentage is a genuine count of
// completed missions within a started parcours.
export async function MyProjects({ userId }: { userId: string }) {
  const paths = await prisma.learningPath.findMany({
    where: { isPublished: true },
    include: { missions: { include: { mission: true } } },
  });

  const progress = await prisma.progress.findMany({
    where: { userId, completed: true },
    select: { missionId: true },
  });
  const completedMissionIds = new Set(progress.map((p) => p.missionId));

  const projects = paths
    .map((path) => {
      const missionIds = path.missions.map((m) => m.missionId);
      const completedCount = missionIds.filter((id) => completedMissionIds.has(id)).length;
      const percent = missionIds.length > 0 ? Math.round((completedCount / missionIds.length) * 100) : 0;

      // Next mission to continue with: the first one in order not yet completed.
      const next = path.missions
        .sort((a, b) => a.order - b.order)
        .find((m) => !completedMissionIds.has(m.missionId));

      return { path, percent, completedCount, total: missionIds.length, nextSlug: next?.mission.slug };
    })
    .filter((p) => p.completedCount > 0 && p.percent < 100)
    .sort((a, b) => b.percent - a.percent);

  if (projects.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <FolderKanban size={18} className="text-or" />
        <h2 className="font-display text-xl text-ivoire">Mes projets en cours</h2>
      </div>
      <div className="space-y-3">
        {projects.map(({ path, percent, completedCount, total, nextSlug }) => (
          <Card key={path.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="font-display text-base text-ivoire">{path.title}</p>
              <p className="mt-1 text-xs text-ivoire-dim">{completedCount} / {total} missions</p>
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-ivoire/10">
                <div className="h-full rounded-full bg-or" style={{ width: `${percent}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-lg text-or">{percent}%</span>
              <Link href={nextSlug ? `/missions/${nextSlug}` : `/parcours/${path.slug}`}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-or px-4 py-2 text-sm font-medium text-noir">
                  Continuer <ArrowRight size={14} />
                </span>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
