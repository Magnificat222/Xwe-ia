import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWizard } from "@/lib/wizards";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const project = await prisma.guidedProject.findUnique({ where: { id } });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
  }

  const wizard = getWizard(project.wizardType);
  if (!wizard) {
    return NextResponse.json({ error: "Type de projet inconnu." }, { status: 400 });
  }

  const { stepKey, values, currentStep, markComplete } = await request.json();

  const existingAnswers = (project.answers as Record<string, Record<string, string>>) ?? {};
  const nextAnswers = stepKey
    ? { ...existingAnswers, [stepKey]: values }
    : existingAnswers;

  const totalSteps = wizard.steps.length;
  const clampedStep =
    typeof currentStep === "number" ? Math.max(0, Math.min(currentStep, totalSteps)) : project.currentStep;

  const updated = await prisma.guidedProject.update({
    where: { id },
    data: {
      answers: nextAnswers,
      currentStep: clampedStep,
      completedAt: markComplete ? new Date() : project.completedAt,
    },
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const project = await prisma.guidedProject.findUnique({ where: { id } });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
  }

  await prisma.guidedProject.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
