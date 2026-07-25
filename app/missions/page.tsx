import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MissionCard } from "@/components/missions/mission-card";
import type { Mission } from "@/types";

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: { categorie?: string };
}) {
  const [dbMissions, categories] = await Promise.all([
    prisma.mission.findMany({
      where: {
        isPublished: true,
        ...(searchParams.categorie ? { category: { slug: searchParams.categorie } } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Adapt the Prisma shape to the domain Mission type used by MissionCard.
  const filtered: Mission[] = dbMissions.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    description: m.description,
    categorySlug: m.category.slug as Mission["categorySlug"],
    level: m.level,
    estimatedMinutes: m.estimatedMinutes,
    recommendedTools: m.recommendedTools,
    steps: m.steps as Mission["steps"],
    tips: m.tips,
    commonMistakes: m.commonMistakes,
    checklist: m.checklist,
    isPremium: m.isPremium,
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Mission center</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Toutes les missions</h1>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/missions"
          className="rounded-full border border-ivoire/15 px-3.5 py-1.5 text-sm text-ivoire-dim hover:border-or/50 hover:text-ivoire"
        >
          Toutes
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/missions?categorie=${category.slug}`}
            className="rounded-full border border-ivoire/15 px-3.5 py-1.5 text-sm text-ivoire-dim hover:border-or/50 hover:text-ivoire"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </main>
  );
}
