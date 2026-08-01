import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { ChallengeForm } from "@/components/quiz/challenge-form";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function QuizStagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ duel?: string }>;
}) {
  const { slug } = await params;
  const { duel: duelId } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/quiz/${slug}`);

  const stage = await prisma.quizStage.findUnique({ where: { slug } });
  if (!stage) notFound();

  const isAdmin = session.user.role === "ADMIN";
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  const isPremium = subscription?.plan === "PREMIUM" || isAdmin;
  const locked = stage.isPremium && !isPremium;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/quiz"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
      >
        <ArrowLeft size={15} /> Retour à l'arène
      </Link>

      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">
          Niveau {stage.level.toLowerCase()}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">{stage.title}</h1>
        <p className="mt-2 text-ivoire-dim">{stage.description}</p>
      </div>

      {locked ? (
        <div className="rounded-xl border border-or/20 bg-or/5 p-6 text-center">
          <Lock size={20} className="mx-auto mb-2 text-or" />
          <p className="text-sm text-ivoire-dim">Cette étape est réservée aux membres Premium.</p>
          <a href="/#tarifs" className="mt-4 inline-block">
            <Button size="sm">Voir les offres Premium</Button>
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          <QuizPlayer stageId={stage.id} duelId={duelId} />

          {!duelId && (
            <div className="rounded-xl border border-ivoire/10 bg-noir-soft/40 p-5">
              <p className="mb-3 text-sm font-medium text-ivoire">Défier un membre sur cette étape</p>
              <ChallengeForm stageId={stage.id} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
