import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LearningPathForm } from "@/components/admin/learning-path-form";
import { ArrowLeft } from "lucide-react";

export default async function NewParcoursPage() {
  const missions = await prisma.mission.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <Link
        href="/admin/parcours"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or"
      >
        <ArrowLeft size={15} /> Retour aux parcours
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Nouveau parcours</h1>
      <LearningPathForm mode="create" missions={missions} />
    </div>
  );
}
