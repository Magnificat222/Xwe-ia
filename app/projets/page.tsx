import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wizards } from "@/lib/wizards";
import { Card } from "@/components/ui/card";
import { StartProjectButton } from "@/components/projects/start-project-button";
import { ArrowLeft, ArrowRight, FolderKanban } from "lucide-react";

export default async function ProjectsHubPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/projets");

  const existingProjects = await prisma.guidedProject.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Projets guidés</p>
      <h1 className="mt-2 font-display text-3xl text-ivoire">Construisez un livrable, étape par étape</h1>
      <p className="mt-2 text-sm text-ivoire-dim">
        Répondez aux questions à votre rythme, reprenez quand vous voulez, et
        téléchargez un document structuré à la fin — vos propres mots, mis en forme.
      </p>

      {existingProjects.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <FolderKanban size={16} className="text-or" />
            <p className="text-sm font-medium text-ivoire">Vos projets</p>
          </div>
          <div className="space-y-2">
            {existingProjects.map((project) => {
              const wizard = wizards[project.wizardType];
              const totalSteps = wizard?.steps.length ?? 1;
              const percent = Math.round((project.currentStep / totalSteps) * 100);
              return (
                <Link key={project.id} href={`/projets/${project.id}`}>
                  <Card className="flex items-center justify-between transition-colors hover:border-or/30">
                    <div>
                      <p className="text-sm text-ivoire">{project.title ?? wizard?.title}</p>
                      <p className="text-xs text-ivoire-dim">
                        {project.completedAt ? "Terminé" : `${percent}% complété`}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-or" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-ivoire">Nouveau projet</p>
        <div className="space-y-3">
          {Object.values(wizards).map((wizard) => (
            <Card key={wizard.type} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-base text-ivoire">{wizard.title}</p>
                <p className="mt-1 text-sm text-ivoire-dim">{wizard.description}</p>
              </div>
              <StartProjectButton wizardType={wizard.type} />
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
