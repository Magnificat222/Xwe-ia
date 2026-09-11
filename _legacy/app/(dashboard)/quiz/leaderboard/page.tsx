import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Trophy } from "lucide-react";

export default async function QuizLeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/quiz/leaderboard");

  const attempts = await prisma.quizAttempt.findMany({
    where: { completedAt: { not: null } },
    select: {
      userId: true,
      totalScore: true,
      badge: true,
      user: { select: { name: true, email: true } },
    },
  });

  const byUser = new Map<
    string,
    { name: string; totalPoints: number; gold: number; silver: number; bronze: number; quizzesPlayed: number }
  >();

  for (const a of attempts) {
    const entry = byUser.get(a.userId) ?? {
      name: a.user.name ?? a.user.email,
      totalPoints: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      quizzesPlayed: 0,
    };
    entry.totalPoints += a.totalScore;
    entry.quizzesPlayed += 1;
    if (a.badge === "GOLD") entry.gold += 1;
    if (a.badge === "SILVER") entry.silver += 1;
    if (a.badge === "BRONZE") entry.bronze += 1;
    byUser.set(a.userId, entry);
  }

  const ranked = Array.from(byUser.entries())
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 50);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/quiz"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
      >
        <ArrowLeft size={15} /> Retour à l'arène
      </Link>

      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Classement</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Les meilleurs de l'arène</h1>
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-ivoire-dim">Personne n'a encore joué — soyez le premier !</p>
      ) : (
        <div className="space-y-2">
          {ranked.map((entry, i) => {
            const isMe = entry.userId === session.user!.id;
            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                  isMe ? "border-or/40 bg-or/5" : "border-ivoire/10 bg-noir-elevated/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-sm font-medium text-ivoire-dim">
                    {i === 0 ? <Trophy size={16} className="text-yellow-400" /> : `#${i + 1}`}
                  </span>
                  <div>
                    <p className="text-sm text-ivoire">
                      {entry.name} {isMe && <span className="text-xs text-or">(vous)</span>}
                    </p>
                    <p className="text-xs text-ivoire-dim">
                      {entry.quizzesPlayed} quiz · Or {entry.gold} · Argent {entry.silver} · Bronze {entry.bronze}
                    </p>
                  </div>
                </div>
                <p className="font-display text-lg text-or">{entry.totalPoints} pts</p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
