import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const duels = await prisma.duel.findMany({
    where: {
      OR: [{ challengerId: session.user.id }, { opponentId: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      stage: { select: { title: true, slug: true } },
      challenger: { select: { id: true, name: true, email: true } },
      opponent: { select: { id: true, name: true, email: true } },
      challengerAttempt: { select: { totalScore: true, completedAt: true } },
      opponentAttempt: { select: { totalScore: true, completedAt: true } },
    },
  });

  return NextResponse.json({ duels });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { stageId, opponentEmail } = await request.json();
  if (!stageId || !opponentEmail) {
    return NextResponse.json({ error: "stageId et opponentEmail requis." }, { status: 400 });
  }

  const opponent = await prisma.user.findUnique({ where: { email: opponentEmail } });
  if (!opponent) {
    return NextResponse.json({ error: "Aucun membre trouvé avec cet e-mail." }, { status: 404 });
  }
  if (opponent.id === session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous défier vous-même." }, { status: 400 });
  }

  const stage = await prisma.quizStage.findUnique({ where: { id: stageId } });
  if (!stage) {
    return NextResponse.json({ error: "Étape introuvable." }, { status: 404 });
  }

  const duel = await prisma.duel.create({
    data: {
      stageId,
      challengerId: session.user.id,
      opponentId: opponent.id,
      mode: "ASYNC",
      status: "PENDING",
    },
  });

  return NextResponse.json({ duel });
}
