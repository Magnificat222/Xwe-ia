import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Crown,
  Lock,
  Swords,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, EmptyState } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { ChallengeLauncher } from "@/components/app/challenge-player";
import { getGameWithChallenges } from "@/lib/queries/arena";
import { requireUser } from "@/lib/auth/guards";
import { resolveAccess } from "@/lib/access";
import { LEVEL_LABELS } from "@/lib/utils";
import { resolveIcon } from "@/lib/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameWithChallenges(slug);
  return { title: game?.title ?? "Jeu" };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await requireUser(`/arene/${slug}`);
  const game = await getGameWithChallenges(slug);
  if (!game || !game.isPublished) notFound();

  const access = await resolveAccess(session, { id: game.id, accessType: game.accessType });
  const Icon = resolveIcon(game.icon, Swords);

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-7">
      <Breadcrumb items={[{ label: "Arène", href: "/arene" }, { label: game.title }]} />

      <header className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-braise/12 text-braise-vif">
          <Icon size={26} strokeWidth={1.6} />
        </span>
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="outline">{LEVEL_LABELS[game.level]}</Badge>
            {game.accessType === "premium" && <Badge tone="or">Premium</Badge>}
          </div>
          <h1 className="font-display text-2xl leading-tight text-ivoire">{game.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ivoire-dim">
            {game.description}
          </p>
        </div>
      </header>

      {!access.allowed ? (
        <Card tone="or">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-or/12 text-or">
              <Lock size={20} />
            </span>
            <div>
              <CardTitle className="text-base">Ce jeu est réservé aux membres Premium</CardTitle>
              <CardDescription>
                L'abonnement Premium ouvre tous les jeux et tous les parcours.
              </CardDescription>
              <Link href="/premium" className="mt-4 inline-block">
                <Button icon={<Crown size={16} />}>Découvrir Premium</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : game.challenges.length === 0 ? (
        <EmptyState
          icon={<Swords size={22} />}
          title="Aucun défi disponible"
          description="Les défis de ce jeu arrivent bientôt."
        />
      ) : (
        <section>
          <h2 className="mb-5 font-display text-lg text-ivoire">
            Les défis ({game.challenges.length})
          </h2>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {game.challenges.map((challenge) => (
              <StaggerItem key={challenge.id}>
                {/* On n'envoie au client que l'énoncé et les options :
                    correctIndex et explication restent côté serveur. */}
                <ChallengeLauncher
                  challengeId={challenge.id}
                  title={challenge.title}
                  durationSeconds={challenge.durationSeconds}
                  points={challenge.points}
                  questions={challenge.questions.map((q) => ({
                    question: q.question,
                    options: q.options,
                  }))}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </PageTransition>
  );
}
