import type { Metadata } from "next";
import Link from "next/link";
import { Route as RouteIcon } from "lucide-react";
import { PathwayCardView } from "@/components/marketing/sections";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardTitle } from "@/components/ui/card";
import { SectionHeading, EmptyState } from "@/components/ui/misc";
import { Stagger, StaggerItem, PageTransition } from "@/components/motion";
import { getSession } from "@/lib/auth/session";
import { getPathways, getCategories } from "@/lib/queries/catalogue";
import { getUserPathways } from "@/lib/queries/progress";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Parcours",
  description:
    "Chaque parcours est une suite de missions qui aboutit à un livrable concret.",
};

export default async function PathwaysPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  // Le catalogue reste ouvert aux visiteurs : c'est la vitrine qui donne envie
  // de créer un compte. Seule la mise en route d'un parcours exige une session.
  const session = await getSession();
  const { categorie } = await searchParams;

  const [pathways, categories, mine] = await Promise.all([
    getPathways({ categorySlug: categorie }),
    getCategories(),
    session ? getUserPathways(session.id) : Promise.resolve([]),
  ]);

  const started = new Map(mine.map((m) => [m.pathwayId, m]));
  const inProgress = mine.filter((m) => m.status === "in_progress");

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-8">
      <SectionHeading
        eyebrow="Parcours"
        title="Choisis ton chemin"
        description="Chaque parcours est une suite de missions qui aboutit à un livrable concret."
      />

      {inProgress.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg text-ivoire">Tes parcours en cours</h2>
          <Stagger className="grid gap-3 sm:grid-cols-2">
            {inProgress.map((item) => (
              <StaggerItem key={item.id}>
                <Link href={`/parcours/${item.pathway.slug}`}>
                  <Card interactive className="h-full">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug">{item.pathway.title}</CardTitle>
                      <Badge tone="or">{item.percent}%</Badge>
                    </div>
                    <Progress value={item.percent} tone="braise" />
                    <p className="mt-3 flex items-center justify-between text-xs text-ivoire-dim">
                      <span>
                        {item.completedCount}/{item.totalCount} missions
                      </span>
                      <span>{formatRelative(item.lastActivityAt)}</span>
                    </p>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <section>
        <nav aria-label="Filtrer par catégorie" className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/parcours"
            className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
              !categorie
                ? "border-or bg-or/12 text-or-vif"
                : "border-ivoire/12 text-ivoire-dim hover:border-or/30 hover:text-ivoire"
            }`}
          >
            Tous
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/parcours?categorie=${category.slug}`}
              className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                categorie === category.slug
                  ? "border-or bg-or/12 text-or-vif"
                  : "border-ivoire/12 text-ivoire-dim hover:border-or/30 hover:text-ivoire"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {pathways.length === 0 ? (
          <EmptyState
            icon={<RouteIcon size={22} />}
            title="Aucun parcours dans cette catégorie"
            description="Essaie une autre catégorie ou consulte tous les parcours."
          />
        ) : (
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map((pathway) => {
              const progress = started.get(pathway.id);
              return (
                <StaggerItem key={pathway.id}>
                  <Link href={`/parcours/${pathway.slug}`} className="block h-full">
                    <div className="relative h-full">
                      <PathwayCardView pathway={pathway} />
                      {progress && (
                        <span className="absolute right-4 top-4 rounded-full bg-noir/80 px-2 py-1 text-[0.65rem] text-or backdrop-blur">
                          {progress.percent}%
                        </span>
                      )}
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>
    </PageTransition>
  );
}
