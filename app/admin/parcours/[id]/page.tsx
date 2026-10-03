import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wizards } from "@/lib/wizards";
import { PathForm } from "@/components/admin/path-form";
import { PathMissionsManager } from "@/components/admin/path-missions-manager";
import { PathAccessPanel } from "@/components/admin/path-access-panel";

export default async function EditPathPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/support");
  const { id } = await params;

  const [path, categories, missions, accesses] = await Promise.all([
    prisma.learningPath.findUnique({ where: { id }, include: { missions: { orderBy: { order: "asc" } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.mission.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    prisma.pathAccess.findMany({
      where: { learningPathId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { email: true } } },
    }),
  ]);
  if (!path) notFound();

  return (
    <div className="space-y-12">
      <div>
        <Link href="/admin/parcours" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
          <ArrowLeft size={15} /> Retour aux parcours
        </Link>
        <h1 className="mb-6 font-display text-2xl text-ivoire">{path.title}</h1>
        <PathForm
          categories={categories}
          wizardTypes={Object.values(wizards).map((w) => ({ type: w.type, title: w.title }))}
          initial={{
            id: path.id, slug: path.slug, title: path.title, description: path.description,
            accessType: path.accessType, creditCost: path.creditCost, isPublished: path.isPublished,
            difficulty: path.difficulty, estimatedMinutes: path.estimatedMinutes,
            resultSummary: path.resultSummary ?? "", deliverableType: path.deliverableType ?? "",
            wizardType: path.wizardType ?? "", categoryId: path.categoryId, displayOrder: path.displayOrder,
          }}
        />
      </div>
      <section>
        <h2 className="mb-4 font-display text-xl text-ivoire">Missions du parcours</h2>
        <PathMissionsManager pathId={path.id} allMissions={missions} initialIds={path.missions.map((m) => m.missionId)} />
      </section>
      <section>
        <h2 className="mb-4 font-display text-xl text-ivoire">Accès individuels</h2>
        <PathAccessPanel
          pathId={path.id}
          rows={accesses.map((a) => ({ id: a.id, email: a.user.email, source: a.source, createdAt: a.createdAt.toISOString() }))}
        />
      </section>
    </div>
  );
}
