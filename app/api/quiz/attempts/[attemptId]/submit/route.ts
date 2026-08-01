import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { QuizQuestionData } from "@/lib/gemini";
import { POINTS_PER_CORRECT_ANSWER, calculateSpeedBonus, determineBadge } from "@/lib/quiz";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Tentative introuvable." }, { status: 404 });
  }
  if (attempt.completedAt) {
    return NextResponse.json({ error: "Cette tentative est déjà terminée." }, { status: 400 });
  }

  const { answers, durationSeconds } = await request.json();
  const questions = attempt.questions as unknown as QuizQuestionData[];

  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return NextResponse.json({ error: "Réponses invalides." }, { status: 400 });
  }

  let correctCount = 0;
  const results = questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      yourAnswer: answers[i],
      isCorrect,
    };
  });

  const score = correctCount * POINTS_PER_CORRECT_ANSWER;
  const safeDuration = typeof durationSeconds === "number" && durationSeconds > 0 ? durationSeconds : 999;
  const speedBonus = calculateSpeedBonus(safeDuration, questions.length);
  const totalScore = score + speedBonus;
  const badge = determineBadge(totalScore);

  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      answers,
      score,
      speedBonus,
      totalScore,
      badge,
      completedAt: new Date(),
      durationSeconds: Math.round(safeDuration),
    },
  });

  // If this attempt belongs to a duel, check whether both sides are now
  // done, and if so settle the duel.
  const duel = await prisma.duel.findFirst({
    where: {
      OR: [{ challengerAttemptId: attemptId }, { opponentAttemptId: attemptId }],
    },
  });

  if (duel && duel.status !== "COMPLETED") {
    const [challengerAttempt, opponentAttempt] = await Promise.all([
      duel.challengerAttemptId
        ? prisma.quizAttempt.findUnique({ where: { id: duel.challengerAttemptId } })
        : null,
      duel.opponentAttemptId
        ? prisma.quizAttempt.findUnique({ where: { id: duel.opponentAttemptId } })
        : null,
    ]);

    if (challengerAttempt?.completedAt && opponentAttempt?.completedAt) {
      const winnerId =
        challengerAttempt.totalScore === opponentAttempt.totalScore
          ? null
          : challengerAttempt.totalScore > opponentAttempt.totalScore
            ? duel.challengerId
            : duel.opponentId;

      await prisma.duel.update({
        where: { id: duel.id },
        data: { status: "COMPLETED", completedAt: new Date(), winnerId },
      });
    }
  }

  return NextResponse.json({ score, speedBonus, totalScore, badge, results });
}
