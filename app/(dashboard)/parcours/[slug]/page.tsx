import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPathAccess } from "@/lib/path-access";
import { getPathProgress } from "@/lib/path-progress";
import { StartProjectButton } from "@/components/projects/start-project-button";
import { UnlockPathButton } from "@/components/missions/unlock-path-button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

export default async function ParcoursDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = await prisma.learningPath.findUnique({
    where: { slug },
    include: { missions: { include: { mission: true }, orderBy: { order: "asc" } } },
  });

  if (!path) notFound();

  // Unpublished paths are visible to admins only (getPathAccess handles it).
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const access = userId
    ? await getPathAccess(userId, path)
    : {
        hasAccess: path.isPublished && path.accessType === "FREE",
        reason: null,
        requires: path.accessType === "FREE" ? ("NONE" as const) : (path.accessType as "PREMIUM" | "CREDITS"),
        creditCost: path.creditCost,
      };
  if (!path.isPublished && !access.hasAccess) notFound();

  const progress = userId && access.hasAccess ? await getPathProgress(userId, path.id) : null;

  const existingProject =
    userId && path.wizardType
      ? await prisma.guidedProject.findFirst({
          where: { userId, wizardType: path.wizardType },
          orderBy: { updatedAt: "desc" },
          select: { id: true, completedAt: true },
        })
      : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/parcours"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
      >
        <ArrowLeft size={15} /> Retour aux parcours
      </Link>
      <div className="mb-10">
        <div className="mb-3">
          {path.accessType === "PREMIUM" && <Badge tone="gold">Premium</Badge>}
          {path.accessType === "CREDITS" && <Badge tone="gold">{path.creditCost} Xwé Crédits</Badge>}
          {path.accessType === "FREE" && <Badge>Gratuit</Badge>}
        </div>
        <h1 className="font-display text-3xl text-ivoire">{path.title}</h1>
        <p className="mt-3 text-ivoire-dim">{path.description}</p>
      </div>

      {progress && progress.total > 0 && (
        <div className="mb-10">
          <div className="mb-2 flex items-center justify-between text-sm text-ivoire-dim">
            <span>{progress.completed} / {progress.total} missions terminées</span>
            <span className="text-or">{progress.percent} %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ivoire/10">
            <div className="h-full rounded-full bg-or transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
          {progress.nextMission ? (
            <Link
              href={`/missions/${progress.nextMission.slug}?parcours=${path.slug}`}
              className="mt-4 inline-block text-sm text-or"
            >
              {progress.completed === 0 ? "Commencer le parcours →" : "Continuer le parcours →"}
            </Link>
          ) : (
            <p className="mt-4 text-sm text-or">Parcours terminé, bravo !</p>
          )}
        </div>
      )}

      {!access.hasAccess && (
        <div className="mb-10 rounded-card border border-or/30 bg-noir-elevated p-6 text-center">
          {access.requires === "CREDITS" && userId && (
            <>
              <p className="mb-4 text-sm text-ivoire-dim">Ce parcours se débloque avec des Xwé Crédits.</p>
              <UnlockPathButton slug={path.slug} creditCost={path.creditCost} />
            </>
          )}
          {access.requires === "PREMIUM" && userId && (
            <p className="text-sm text-ivoire-dim">Ce parcours est réservé aux membres Premium.</p>
          )}
          {!userId && (
            <Link href={`/login?callbackUrl=/parcours/${path.slug}`} className="text-sm text-or">
              Connectez-vous pour accéder à ce parcours
            </Link>
          )}
        </div>
      )}

      {access.hasAccess && path.wizardType && (
        <div className="mb-10 rounded-card border border-or/30 bg-noir-elevated p-6">
          <p className="font-display text-lg text-ivoire">Votre livrable</p>
          {path.resultSummary && <p className="mt-1 text-sm text-ivoire-dim">{path.resultSummary}</p>}
          <div className="mt-4">
            {existingProject ? (
              <Link href={`/projets/${existingProject.id}`} className="text-sm text-or">
                {existingProject.completedAt ? "Voir mon projet terminé →" : "Reprendre mon projet →"}
              </Link>
            ) : (
              <StartProjectButton wizardType={path.wizardType} />
            )}
          </div>
        </div>
      )}

      <div className="relative pl-4">
        <div className="trajectoire-line absolute left-[15px] top-2 h-[calc(100%-1rem)] w-px" />
        <ol className="space-y-6">
          {path.missions.map(({ mission }, i) => (
            <li key={mission.id} className="relative flex items-start gap-5">
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-or/40 bg-noir-elevated font-mono text-xs text-or">
                {i + 1}
              </span>
              {access.hasAccess ? (
              <Link
                href={`/missions/${mission.slug}?parcours=${path.slug}`}
                className="flex-1 rounded-card border border-ivoire/10 bg-noir-elevated p-4 transition-colors hover:border-or/30"
              >
                <p className="flex items-center justify-between gap-2 font-display text-base text-ivoire">
                  {mission.title}
                  {progress?.completedIds.has(mission.id) && <CheckCircle2 size={16} className="shrink-0 text-or" />}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ivoire-dim">
                  <Clock size={13} /> {formatMinutes(mission.estimatedMinutes)}
                </p>
              </Link>
              ) : (
              <div className="flex-1 rounded-card border border-ivoire/10 bg-noir-elevated p-4 opacity-60">
                <p className="font-display text-base text-ivoire">{mission.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ivoire-dim">
                  <Clock size={13} /> {formatMinutes(mission.estimatedMinutes)}
                </p>
              </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
