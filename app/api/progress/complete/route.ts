import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessMission, getPathAccess } from "@/lib/path-access";
import { getPathProgress } from "@/lib/path-progress";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { missionId, pathSlug } = await request.json();
  if (!missionId || typeof missionId !== "string") {
    return NextResponse.json({ error: "missionId requis." }, { status: 400 });
  }

  // Only published missions the user can really open may be completed.
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: { categoryId: true, createdAt: true, isPublished: true, isPremium: true },
  });
  if (!mission || !mission.isPublished) {
    return NextResponse.json({ error: "Mission introuvable." }, { status: 404 });
  }
  const access = await canAccessMission(session.user.id, missionId, mission.isPremium);
  if (!access.allowed) {
    return NextResponse.json({ error: "Accès à cette mission verrouillé." }, { status: 403 });
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

  // Inside a path: the next mission follows the PATH order (first one not yet
  // completed), and the path is reported as finished when nothing is left.
  if (typeof pathSlug === "string" && pathSlug) {
    const path = await prisma.learningPath.findUnique({
      where: { slug: pathSlug },
      select: { id: true, slug: true, accessType: true, creditCost: true, isPublished: true, missions: { select: { missionId: true } } },
    });
    const inPath = path?.missions.some((m) => m.missionId === missionId);
    if (path && inPath && (await getPathAccess(session.user.id, path)).hasAccess) {
      const progress = await getPathProgress(session.user.id, path.id);
      return NextResponse.json({
        ok: true,
        nextMissionSlug: progress.nextMission?.slug ?? null,
        pathSlug: path.slug,
        pathCompleted: progress.total > 0 && progress.completed >= progress.total,
        percent: progress.percent,
      });
    }
  }

  // Outside a path: legacy behaviour, "next mission" by category + date.
  const nextMission = await prisma.mission.findFirst({
    where: {
      isPublished: true,
      categoryId: mission.categoryId,
      createdAt: { lt: mission.createdAt },
    },
    orderBy: { createdAt: "desc" },
    select: { slug: true },
  });

  return NextResponse.json({ ok: true, nextMissionSlug: nextMission?.slug ?? null });
}
