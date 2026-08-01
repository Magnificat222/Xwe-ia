import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuizQuestions } from "@/lib/gemini";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ stageId: string }> }
) {
  const { stageId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const stage = await prisma.quizStage.findUnique({ where: { id: stageId } });
  if (!stage) {
    return NextResponse.json({ error: "Étape introuvable." }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  if (stage.isPremium && !isAdmin) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    if (subscription?.plan !== "PREMIUM") {
      return NextResponse.json({ error: "Cette étape est réservée aux membres Premium." }, { status: 403 });
    }
  }

  const { duelId } = await request.json().catch(() => ({ duelId: undefined }));

  let duel = null;
  if (duelId) {
    duel = await prisma.duel.findUnique({ where: { id: duelId } });
    if (!duel || duel.stageId !== stageId) {
      return NextResponse.json({ error: "Défi introuvable pour cette étape." }, { status: 404 });
    }
    if (duel.challengerId !== session.user.id && duel.opponentId !== session.user.id) {
      return NextResponse.json({ error: "Ce défi ne vous concerne pas." }, { status: 403 });
    }
    if (duel.status === "DECLINED" || duel.status === "EXPIRED" || duel.status === "COMPLETED") {
      return NextResponse.json({ error: "Ce défi n'est plus jouable." }, { status: 400 });
    }
  }

  const questions = await generateQuizQuestions(stage.topic, stage.level, stage.questionCount);

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      stageId: stage.id,
      questions: questions as unknown as object,
    },
  });

  if (duel) {
    const isChallenger = duel.challengerId === session.user.id;
    await prisma.duel.update({
      where: { id: duel.id },
      data: isChallenger
        ? { challengerAttemptId: attempt.id }
        : { opponentAttemptId: attempt.id },
    });
  }

  // Never send correctIndex/explanation to the client before they answer.
  const publicQuestions = questions.map((q) => ({ question: q.question, options: q.options }));

  return NextResponse.json({ attemptId: attempt.id, questions: publicQuestions });
}
