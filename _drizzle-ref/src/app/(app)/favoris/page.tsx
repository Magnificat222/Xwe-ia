import type { Metadata } from "next";
import Link from "next/link";
import { inArray } from "drizzle-orm";
import { Star, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { pathways, tools, prompts, resources } from "@/db/schema";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, SectionHeading } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { FavoriteButton } from "@/components/app/actions";
import { requireUser } from "@/lib/auth/guards";
import { getFavorites } from "@/lib/queries/progress";

export const metadata: Metadata = { title: "Favoris" };

export default async function FavoritesPage() {
  const session = await requireUser("/favoris");
  const favorites = await getFavorites(session.id);

  const idsOf = (type: string) =>
    favorites.filter((f) => f.entityType === type).map((f) => f.entityId);

  const [pathwayRows, toolRows, promptRows, resourceRows] = await Promise.all([
    idsOf("pathway").length
      ? db.select().from(pathways).where(inArray(pathways.id, idsOf("pathway")))
      : Promise.resolve([]),
    idsOf("tool").length
      ? db.select().from(tools).where(inArray(tools.id, idsOf("tool")))
      : Promise.resolve([]),
    idsOf("prompt").length
      ? db.select().from(prompts).where(inArray(prompts.id, idsOf("prompt")))
      : Promise.resolve([]),
    idsOf("resource").length
      ? db.select().from(resources).where(inArray(resources.id, idsOf("resource")))
      : Promise.resolve([]),
  ]);

  const total = pathwayRows.length + toolRows.length + promptRows.length + resourceRows.length;

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-8">
      <SectionHeading
        eyebrow="Ta sélection"
        title="Favoris"
        description="Les parcours, outils et ressources que tu as mis de côté."
      />

      {total === 0 ? (
        <EmptyState
          icon={<Star size={22} />}
          title="Aucun favori"
          description="Utilise l'étoile sur un parcours ou un outil pour le retrouver ici."
          action={
            <Link href="/parcours">
              <Button>Explorer les parcours</Button>
            </Link>
          }
        />
      ) : (
        <>
          {pathwayRows.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg text-ivoire">Parcours</h2>
              <Stagger className="grid gap-3 sm:grid-cols-2">
                {pathwayRows.map((pathway) => (
                  <StaggerItem key={pathway.id}>
                    <Card className="flex h-full items-start justify-between gap-3">
                      <Link href={`/parcours/${pathway.slug}`} className="min-w-0 flex-1">
                        <CardTitle className="text-sm leading-snug">{pathway.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">
                          {pathway.summary}
                        </CardDescription>
                      </Link>
                      <FavoriteButton entityType="pathway" entityId={pathway.id} initial compact />
                    </Card>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}

          {toolRows.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg text-ivoire">Outils</h2>
              <Stagger className="grid gap-3 sm:grid-cols-2">
                {toolRows.map((tool) => (
                  <StaggerItem key={tool.id}>
                    <Card className="flex h-full items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm">{tool.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">
                          {tool.description}
                        </CardDescription>
                        {tool.url && (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-or hover:underline"
                          >
                            Ouvrir <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      <FavoriteButton entityType="tool" entityId={tool.id} initial compact />
                    </Card>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}

          {promptRows.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg text-ivoire">Prompts</h2>
              <Stagger className="space-y-3">
                {promptRows.map((prompt) => (
                  <StaggerItem key={prompt.id}>
                    <Card className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm">{prompt.title}</CardTitle>
                        <p className="mt-1.5 line-clamp-2 font-mono text-xs text-ivoire-dim">
                          {prompt.body}
                        </p>
                      </div>
                      <FavoriteButton entityType="prompt" entityId={prompt.id} initial compact />
                    </Card>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}

          {resourceRows.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg text-ivoire">Ressources</h2>
              <Stagger className="grid gap-3 sm:grid-cols-2">
                {resourceRows.map((resource) => (
                  <StaggerItem key={resource.id}>
                    <Card className="flex h-full items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Badge tone="outline">{resource.type}</Badge>
                        <CardTitle className="mt-2 text-sm">{resource.title}</CardTitle>
                      </div>
                      <FavoriteButton entityType="resource" entityId={resource.id} initial compact />
                    </Card>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}
        </>
      )}
    </PageTransition>
  );
}
