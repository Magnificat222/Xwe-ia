import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { mission: true, learningPath: true, prompt: true, tool: true },
  });

  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { missionId, learningPathId, promptId, toolId } = await request.json();
  const targetField = { missionId, learningPathId, promptId, toolId };

  const existing = await prisma.favorite.findFirst({
    where: { userId: session.user.id, ...targetField },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({
    data: { userId: session.user.id, ...targetField },
  });
  return NextResponse.json({ favorited: true });
}
