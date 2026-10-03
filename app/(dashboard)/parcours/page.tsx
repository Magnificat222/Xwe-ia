import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getProgressPercentByPath } from "@/lib/path-progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

export default async function ParcoursPage() {
  const paths = await prisma.learningPath.findMany({
    where: { isPublished: true },
    include: { missions: true },
    orderBy: [{ displayOrder: "asc" }, { accessType: "asc" }, { createdAt: "desc" }],
  });

  const session = await auth();
  const percents = session?.user?.id ? await getProgressPercentByPath(session.user.id, paths) : {};

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Parcours</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Tous les parcours</h1>
      </div>

      {paths.length === 0 && (
        <p className="text-ivoire-dim">
          Aucun parcours publié pour l'instant — lance `npm run db:seed`.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {paths.map((path) => (
          <Link key={path.id} href={`/parcours/${path.slug}`}>
            <Card className="flex h-full flex-col justify-between">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  {path.accessType === "PREMIUM" && <Badge tone="gold">Premium</Badge>}
                  {path.accessType === "CREDITS" && <Badge tone="gold">{path.creditCost} Xwé Crédits</Badge>}
                  {path.accessType === "FREE" && <Badge>Gratuit</Badge>}
                  <span className="text-xs text-ivoire-dim">
                    {path.missions.length} mission{path.missions.length > 1 ? "s" : ""}
                  </span>
                </div>
                <h3 className="font-display text-lg text-ivoire">{path.title}</h3>
                <p className="mt-2 text-sm text-ivoire-dim">{path.description}</p>
              </div>
              {percents[path.id] > 0 && (
                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-ivoire/10">
                    <div className="h-full rounded-full bg-or" style={{ width: `${percents[path.id]}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-ivoire-dim">{percents[path.id]} % terminé</p>
                </div>
              )}
              <div className="mt-6 flex items-center gap-1.5 text-sm text-or">
                Découvrir <ArrowUpRight size={14} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
