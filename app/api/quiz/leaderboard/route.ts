import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

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

  const leaderboard = Array.from(byUser.entries())
    .map(([userId, stats]) => ({ userId, ...stats, isMe: userId === session.user!.id }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 50);

  return NextResponse.json({ leaderboard });
}
