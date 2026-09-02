import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWizard } from "@/lib/wizards";

export async function GET(
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

  const answers = (project.answers as Record<string, Record<string, string>>) ?? {};

  // Purely an assembly of the person's own answers, formatted — no text is
  // generated or rewritten by AI here.
  const children: Paragraph[] = [
    new Paragraph({
      text: project.title ?? wizard.title,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Préparé avec Xwé IA — ${new Date().toLocaleDateString("fr-FR")}`,
          italics: true,
          color: "888888",
        }),
      ],
    }),
    new Paragraph({ text: "" }),
  ];

  for (const step of wizard.steps) {
    children.push(new Paragraph({ text: step.title, heading: HeadingLevel.HEADING_1 }));
    const stepAnswers = answers[step.key] ?? {};
    for (const field of step.fields) {
      const value = stepAnswers[field.key]?.trim();
      children.push(
        new Paragraph({
          children: [new TextRun({ text: field.label, bold: true })],
        })
      );
      children.push(new Paragraph({ text: value || "(non renseigné)" }));
      children.push(new Paragraph({ text: "" }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);

  const fileName = `${(project.title ?? wizard.title).replace(/[^a-zA-Z0-9]+/g, "-")}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
