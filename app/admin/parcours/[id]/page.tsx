import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LearningPathForm } from "@/components/admin/learning-path-form";
import { ArrowLeft } from "lucide-react";

export default async function EditParcoursPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [path, allMissions] = await Promise.all([
    prisma.learningPath.findUnique({
      where: { id },
      include: {
        missions: {
          include: { mission: { select: { id: true, title: true, slug: true } } },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.mission.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    }),
  ]);

  if (!path) notFound();

  const selectedMissions = path.missions.map((pm) => ({
    id: pm.mission.id,
    title: pm.mission.title,
    order: pm.order,
  }));

  return (
    <div>
      <Link
        href="/admin/parcours"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or"
      >
        <ArrowLeft size={15} /> Retour aux parcours
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">
        Modifier : {path.title}
      </h1>
      <LearningPathForm
        mode="edit"
        pathId={id}
        missions={allMissions}
        defaultValues={{
          slug: path.slug,
          title: path.title,
          description: path.description,
          icon: path.icon ?? undefined,
          category: path.category ?? undefined,
          targetAudience: path.targetAudience,
          difficulty: path.difficulty,
          estimatedHours: path.estimatedHours ?? undefined,
          resultTitle: path.resultTitle ?? undefined,
          resultDescription: path.resultDescription ?? undefined,
          priceXof: path.priceXof,
          isPremium: path.isPremium,
          isPublished: path.isPublished,
          selectedMissions,
        }}
      />
    </div>
  );
}
