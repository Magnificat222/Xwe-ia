import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWizard } from "@/lib/wizards";

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

  const project = await prisma.guidedProject.create({
    data: {
      userId: session.user.id,
      wizardType,
      title: wizard.title,
      answers: {},
    },
  });

  return NextResponse.json({ project });
}
