import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWizard } from "@/lib/wizards";
import { ProjectWizard } from "@/components/projects/project-wizard";
import { ArrowLeft } from "lucide-react";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/projets/${id}`);

  const project = await prisma.guidedProject.findUnique({ where: { id } });
  if (!project || project.userId !== session.user.id) notFound();

  const wizard = getWizard(project.wizardType);
  if (!wizard) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/projets" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour à mes projets
      </Link>

      <ProjectWizard
        projectId={project.id}
        wizard={wizard}
        initialAnswers={(project.answers as Record<string, Record<string, string>>) ?? {}}
        initialStep={project.currentStep}
        isComplete={Boolean(project.completedAt)}
      />
    </main>
  );
}
