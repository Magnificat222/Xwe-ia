import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { badgeLabel } from "@/lib/quiz";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowUpRight, Lock, Medal, Swords, Trophy } from "lucide-react";

const BADGE_COLOR: Record<string, string> = {
  GOLD: "text-yellow-400",
  SILVER: "text-slate-300",
  BRONZE: "text-orange-400",
};

export default async function QuizHubPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/quiz");

  const isAdmin = session.user.role === "ADMIN";
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  const isPremium = subscription?.plan === "PREMIUM" || isAdmin;

  const stages = await prisma.quizStage.findMany({ orderBy: { order: "asc" } });
  const myAttempts = await prisma.quizAttempt.findMany({
    where: { userId: session.user.id, completedAt: { not: null } },
    select: { stageId: true, badge: true },
  });

  const badgeRank: Record<string, number> = { BRONZE: 1, SILVER: 2, GOLD: 3 };
  const bestByStage = new Map<string, string | null>();
  for (const a of myAttempts) {
    const current = bestByStage.get(a.stageId);
    const currentRank = current ? badgeRank[current] : 0;
    const attemptRank = a.badge ? badgeRank[a.badge] : 0;
    if (!current || attemptRank > currentRank) bestByStage.set(a.stageId, a.badge);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
      >
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Arène de quiz</p>
          <h1 className="mt-2 font-display text-3xl text-ivoire">Testez vos connaissances en IA</h1>
          <p className="mt-2 text-ivoire-dim">
            Des questions générées à chaque partie — jamais deux fois les mêmes. Jouez en solo ou défiez un membre.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/quiz/leaderboard">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ivoire/15 px-4 py-2 text-sm text-ivoire-dim transition-colors hover:border-or/40 hover:text-or">
              <Trophy size={15} /> Classement
            </span>
          </Link>
          <Link href="/quiz/duels">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ivoire/15 px-4 py-2 text-sm text-ivoire-dim transition-colors hover:border-or/40 hover:text-or">
              <Swords size={15} /> Mes défis
            </span>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const locked = stage.isPremium && !isPremium;
          const bestBadge = bestByStage.get(stage.id) ?? null;

          return (
            <Card key={stage.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-or/10 text-or">
                  <Medal size={20} />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="font-display text-lg text-ivoire">{stage.title}</h2>
                    {stage.isPremium && (
                      <Badge tone="gold" className="gap-1">
                        <Lock size={11} /> Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-ivoire-dim">{stage.description}</p>
                  <p className="mt-1 text-xs text-ivoire-dim">
                    {stage.questionCount} questions · niveau {stage.level.toLowerCase()}
                    {bestBadge && (
                      <span className={`ml-2 font-medium ${BADGE_COLOR[bestBadge]}`}>
                        · Meilleur badge : {badgeLabel(bestBadge as "GOLD" | "SILVER" | "BRONZE")}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {locked ? (
                <span className="shrink-0 rounded-full border border-ivoire/15 px-4 py-2 text-sm text-ivoire-dim opacity-60">
                  Premium requis
                </span>
              ) : (
                <Link href={`/quiz/${stage.slug}`} className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-or px-4 py-2 text-sm font-medium text-noir">
                    Jouer <ArrowUpRight size={14} />
                  </span>
                </Link>
              )}
            </Card>
          );
        })}
      </div>
    </main>
  );
}
