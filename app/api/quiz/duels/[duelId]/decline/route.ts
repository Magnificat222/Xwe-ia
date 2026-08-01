import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ duelId: string }> }
) {
  const { duelId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const duel = await prisma.duel.findUnique({ where: { id: duelId } });
  if (!duel || duel.opponentId !== session.user.id) {
    return NextResponse.json({ error: "Défi introuvable." }, { status: 404 });
  }

  await prisma.duel.update({
    where: { id: duelId },
    data: { status: "DECLINED", respondedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
