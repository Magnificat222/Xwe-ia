import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";
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
          {path.isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>Gratuit</Badge>}
        </div>
        <h1 className="font-display text-3xl text-ivoire">{path.title}</h1>
        <p className="mt-3 text-ivoire-dim">{path.description}</p>
      </div>

      <div className="relative pl-4">
        <div className="trajectoire-line absolute left-[15px] top-2 h-[calc(100%-1rem)] w-px" />
        <ol className="space-y-6">
          {path.missions.map(({ mission }, i) => (
            <li key={mission.id} className="relative flex items-start gap-5">
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-or/40 bg-noir-soft font-mono text-xs text-or">
                {i + 1}
              </span>
              <Link
                href={`/missions/${mission.slug}`}
                className="flex-1 rounded-card border border-ivoire/10 bg-noir-soft p-4 transition-colors hover:border-or/30"
              >
                <p className="font-display text-base text-ivoire">{mission.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ivoire-dim">
                  <Clock size={13} /> {formatMinutes(mission.estimatedMinutes)}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
