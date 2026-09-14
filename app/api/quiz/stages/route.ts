import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BADGE_RANK: Record<string, number> = { BRONZE: 1, SILVER: 2, GOLD: 3 };

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  const isPremium = subscription?.plan === "PREMIUM" || isAdmin;

  const [stages, myAttempts] = await Promise.all([
    prisma.quizStage.findMany({ orderBy: { order: "asc" } }),
    prisma.quizAttempt.findMany({
      where: { userId: session.user.id, completedAt: { not: null } },
      select: { stageId: true, badge: true, totalScore: true },
    }),
  ]);

  const bestByStage = new Map<string, { badge: string | null; totalScore: number }>();
  for (const attempt of myAttempts) {
    const current = bestByStage.get(attempt.stageId);
    const currentRank = current?.badge ? BADGE_RANK[current.badge] : 0;
    const attemptRank = attempt.badge ? BADGE_RANK[attempt.badge] : 0;
    if (!current || attemptRank > currentRank) {
      bestByStage.set(attempt.stageId, { badge: attempt.badge, totalScore: attempt.totalScore });
    }
  }

  const result = stages.map((stage) => ({
    ...stage,
    locked: stage.isPremium && !isPremium,
    bestBadge: bestByStage.get(stage.id)?.badge ?? null,
    bestScore: bestByStage.get(stage.id)?.totalScore ?? null,
  }));

  return NextResponse.json({ stages: result });
}
