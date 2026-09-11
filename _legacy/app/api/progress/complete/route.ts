import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { missionId } = await request.json();
  if (!missionId) {
    return NextResponse.json({ error: "missionId requis." }, { status: 400 });
  }

  await prisma.progress.upsert({
    where: { userId_missionId: { userId: session.user.id, missionId } },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: session.user.id,
      missionId,
      completed: true,
      completedAt: new Date(),
    },
  });

  const currentMission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: { categoryId: true, createdAt: true },
  });

  let nextMissionSlug: string | null = null;

  if (currentMission) {
    const nextMission = await prisma.mission.findFirst({
      where: {
        isPublished: true,
        categoryId: currentMission.categoryId,
        createdAt: { lt: currentMission.createdAt },
      },
      orderBy: { createdAt: "desc" },
      select: { slug: true },
    });
    nextMissionSlug = nextMission?.slug ?? null;
  }

  return NextResponse.json({ ok: true, nextMissionSlug });
}
