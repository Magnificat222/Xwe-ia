import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { QuizQuestionData } from "@/lib/gemini";
import { POINTS_PER_CORRECT_ANSWER, calculateSpeedBonus, determineBadge } from "@/lib/quiz";
import { notify } from "@/lib/notifications";

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

  const body = await request.json().catch(() => null);
  const answers: unknown = body && typeof body === "object" ? (body as { answers?: unknown }).answers : null;
  const questions = attempt.questions as unknown as QuizQuestionData[];

  // Chaque réponse est un index d'option valide (ou -1 = sans réponse).
  const answersValid =
    Array.isArray(answers) &&
    answers.length === questions.length &&
    answers.every(
      (a, i) => Number.isInteger(a) && a >= -1 && a < (questions[i]?.options?.length ?? 0)
    );
  if (!answersValid) {
    return NextResponse.json({ error: "Réponses invalides." }, { status: 400 });
  }
  const safeAnswers = answers as number[];

  let correctCount = 0;
  const results = questions.map((q, i) => {
    const isCorrect = safeAnswers[i] === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      yourAnswer: safeAnswers[i],
      isCorrect,
    };
  });

  const score = correctCount * POINTS_PER_CORRECT_ANSWER;
  // La durée est mesurée par le SERVEUR (création de la tentative -> maintenant).
  // Ce que le navigateur envoie n'est jamais utilisé : le bonus de vitesse ne peut plus être truqué.
  const safeDuration = Math.max(1, (Date.now() - attempt.startedAt.getTime()) / 1000);
  const speedBonus = calculateSpeedBonus(safeDuration, questions.length);
  const totalScore = score + speedBonus;
  const badge = determineBadge(totalScore);

  // Atomic claim: only one request can complete an attempt, even if two
  // submissions arrive at the same time (the loser gets a 400, no double scoring/duel).
  const claimed = await prisma.quizAttempt.updateMany({
    where: { id: attemptId, completedAt: null },
    data: {
      answers: safeAnswers,
      score,
      speedBonus,
      totalScore,
      badge,
      completedAt: new Date(),
      durationSeconds: Math.round(safeDuration),
    },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ error: "Cette tentative est déjà terminée." }, { status: 400 });
  }

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

      const outcomeFor = (userId: string) =>
        winnerId === null ? "Match nul" : winnerId === userId ? "Victoire" : "Défaite";

      await Promise.all([
        notify(
          duel.challengerId,
          "DUEL_RESULT",
          `Votre duel est terminé — ${outcomeFor(duel.challengerId)}.`,
          "/quiz/duels"
        ),
        notify(
          duel.opponentId,
          "DUEL_RESULT",
          `Votre duel est terminé — ${outcomeFor(duel.opponentId)}.`,
          "/quiz/duels"
        ),
      ]);
    }
  }

  return NextResponse.json({ score, speedBonus, totalScore, badge, results });
}
