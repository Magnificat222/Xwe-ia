import type { Metadata } from "next";
import { Route, Target } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Breadcrumb, EmptyState } from "@/components/ui/misc";
import { PathwayCardView } from "@/components/marketing/sections";
import { Stagger, StaggerItem, PageTransition } from "@/components/motion";
import { SetGoalButton } from "@/components/app/actions";
import { getGoalBySlug, getPathways } from "@/lib/queries/catalogue";
import { getSession } from "@/lib/auth/session";
import { getCurrentGoal } from "@/lib/queries/progress";
import { resolveIcon } from "@/lib/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const goal = await getGoalBySlug(slug);
  return { title: goal?.title ?? "Objectif", description: goal?.tagline };
}

export default async function GoalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [goal, session] = await Promise.all([getGoalBySlug(slug), getSession()]);
  if (!goal || !goal.isActive) notFound();

  // On repasse par getPathways pour disposer du nombre de missions dans la carte.
  const [pathways, current] = await Promise.all([
    getPathways({ goalSlug: slug }),
    session ? getCurrentGoal(session.id) : Promise.resolve(null),
  ]);
  const Icon = resolveIcon(goal.icon, Target);

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-8">
      <Breadcrumb items={[{ label: "Objectifs", href: "/objectifs" }, { label: goal.title }]} />

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-or/10 text-or">
            <Icon size={26} strokeWidth={1.6} />
          </span>
          <div>
            <h1 className="font-display text-2xl leading-tight text-ivoire sm:text-3xl">
              {goal.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ivoire-dim">
              {goal.description || goal.tagline}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {session ? (
            <SetGoalButton goalId={goal.id} isCurrent={current?.id === goal.id} />
          ) : (
            <Link href="/inscription">
              <Button size="lg">Commencer</Button>
            </Link>
          )}
        </div>
      </header>

      <section>
        <h2 className="mb-5 font-display text-lg text-ivoire">
          Les parcours pour y arriver ({pathways.length})
        </h2>
        {pathways.length === 0 ? (
          <EmptyState
            icon={<Route size={22} />}
            title="Aucun parcours pour l'instant"
            description="De nouveaux parcours arrivent régulièrement. Consulte le catalogue complet."
            action={
              <Link href="/parcours">
                <Button>Voir tous les parcours</Button>
              </Link>
            }
          />
        ) : (
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map((pathway) => (
              <StaggerItem key={pathway.id}>
                <Link href={`/parcours/${pathway.slug}`} className="block h-full">
                  <PathwayCardView pathway={pathway} />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </PageTransition>
  );
}
