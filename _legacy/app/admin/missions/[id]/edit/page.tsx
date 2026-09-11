import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MissionForm } from "@/components/admin/mission-form";
import { ArrowLeft } from "lucide-react";

export default async function EditMissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [mission, categories, tools] = await Promise.all([
    prisma.mission.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tool.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!mission) notFound();

  return (
    <div>
      <Link href="/admin/missions" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour aux missions
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Modifier la mission</h1>
      <MissionForm
        mode="edit"
        missionId={mission.id}
        categories={categories}
        tools={tools}
        initial={{
          slug: mission.slug,
          title: mission.title,
          description: mission.description,
          categoryId: mission.categoryId,
          level: mission.level,
          estimatedMinutes: mission.estimatedMinutes,
          recommendedTools: mission.recommendedTools,
          steps: mission.steps as never,
          tips: mission.tips,
          commonMistakes: mission.commonMistakes,
          checklist: mission.checklist,
          isPremium: mission.isPremium,
          isPublished: mission.isPublished,
        }}
      />
    </div>
  );
}
