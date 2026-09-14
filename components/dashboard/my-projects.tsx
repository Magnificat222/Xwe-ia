import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { wizards } from "@/lib/wizards";
import { Card } from "@/components/ui/card";
import { ArrowRight, FolderKanban } from "lucide-react";

// "Mes projets" combines two real, unmocked sources:
// 1. Parcours in progress — a LearningPath grouping missions, tracked via
//    each user's real Progress rows.
// 2. Guided project wizards (business plan, etc.) — real GuidedProject rows
//    with the user's own saved answers, no AI involved.
export async function MyProjects({ userId }: { userId: string }) {
  const [paths, progress, guidedProjects] = await Promise.all([
    prisma.learningPath.findMany({
      where: { isPublished: true },
      include: { missions: { include: { mission: true } } },
    }),
    prisma.progress.findMany({ where: { userId, completed: true }, select: { missionId: true } }),
    prisma.guidedProject.findMany({ where: { userId, completedAt: null }, orderBy: { updatedAt: "desc" } }),
  ]);

  const completedMissionIds = new Set(progress.map((p) => p.missionId));

  const pathProjects = paths
    .map((path) => {
      const missionIds = path.missions.map((m) => m.missionId);
      const completedCount = missionIds.filter((id) => completedMissionIds.has(id)).length;
      const percent = missionIds.length > 0 ? Math.round((completedCount / missionIds.length) * 100) : 0;
      const next = path.missions
        .sort((a, b) => a.order - b.order)
        .find((m) => !completedMissionIds.has(m.missionId));

      return {
        kind: "parcours" as const,
        id: path.id,
        title: path.title,
        subtitle: `${completedCount} / ${missionIds.length} missions`,
        percent,
        href: next ? `/missions/${next.mission.slug}` : `/parcours/${path.slug}`,
      };
    })
    .filter((p) => p.percent > 0 && p.percent < 100);

  const wizardProjects = guidedProjects.map((project) => {
    const wizard = wizards[project.wizardType];
    const totalSteps = wizard?.steps.length ?? 1;
    const percent = Math.round((project.currentStep / totalSteps) * 100);
    return {
      kind: "projet" as const,
      id: project.id,
      title: project.title ?? wizard?.title ?? "Projet",
      subtitle: `Étape ${Math.min(project.currentStep + 1, totalSteps)} / ${totalSteps}`,
      percent,
      href: `/projets/${project.id}`,
    };
  });

  const allProjects = [...wizardProjects, ...pathProjects].sort((a, b) => b.percent - a.percent);

  if (allProjects.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <FolderKanban size={18} className="text-or" />
        <h2 className="font-display text-xl text-ivoire">Mes projets en cours</h2>
      </div>
      <div className="space-y-3">
        {allProjects.map((p) => (
          <Card key={`${p.kind}-${p.id}`} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="font-display text-base text-ivoire">{p.title}</p>
              <p className="mt-1 text-xs text-ivoire-dim">{p.subtitle}</p>
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-ivoire/10">
                <div className="h-full rounded-full bg-or" style={{ width: `${p.percent}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-lg text-or">{p.percent}%</span>
              <Link href={p.href}>
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
