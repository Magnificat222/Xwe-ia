import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWizard } from "@/lib/wizards";
import { canUseWizard } from "@/lib/path-access";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { wizardType } = await request.json();
  const wizard = getWizard(wizardType);
  if (!wizard) {
    return NextResponse.json({ error: "Type de projet inconnu." }, { status: 400 });
  }

  // If an admin created a path for this wizard (Business Plan path), the user
  // must have access to it (free / Premium / credits / grant).
  const { allowed, path } = await canUseWizard(session.user.id, wizardType);
  if (!allowed) {
    return NextResponse.json(
      { error: "Ce parcours doit être débloqué avant de commencer.", pathSlug: path?.slug },
      { status: 403 }
    );
  }

  const project = await prisma.guidedProject.create({
    data: {
      userId: session.user.id,
      wizardType,
      learningPathId: path?.id ?? null,
      title: wizard.title,
      answers: {},
    },
  });

  return NextResponse.json({ project });
}
