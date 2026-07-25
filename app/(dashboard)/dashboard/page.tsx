import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Clock } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const userId = session.user.id;

  const [totalMissions, completedCount, history, allMissions] = await Promise.all([
    prisma.mission.count({ where: { isPublished: true } }),
    prisma.progress.count({ where: { userId, completed: true } }),
    prisma.history.findMany({
      where: { userId },
      include: { mission: true },
      orderBy: { viewedAt: "desc" },
      take: 3,
    }),
    prisma.mission.findMany({ where: { isPublished: true }, take: 6 }),
  ]);

  const recentMissions = history.map((h) => h.mission);
  const recommended = allMissions.slice(0, 3);
  const percent = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  // TODO: badges are earned via app logic (e.g. first mission completed,
  // 7-day streak) — this is a placeholder until that logic exists.
  const badges = completedCount >= 1 ? ["Premier pas"] : [];

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Tableau de bord</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">
          Bon retour{session.user.name ? `, ${session.user.name}` : ""} 👋
        </h1>
        <p className="mt-1 text-ivoire-dim">Reprenez là où vous vous êtes arrêté.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-5 md:col-span-1">
          <ProgressRing percent={percent} />
          <div>
            <p className="font-display text-lg text-ivoire">Progression</p>
            <p className="text-sm text-ivoire-dim">
              {completedCount} / {totalMissions} missions
            </p>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <p className="mb-3 font-display text-lg text-ivoire">Badges</p>
          <div className="flex flex-wrap gap-2">
            {badges.length === 0 && (
              <p className="text-sm text-ivoire-dim">
                Terminez votre première mission pour débloquer un badge.
              </p>
            )}
            {badges.map((badge) => (
              <Badge key={badge} tone="gold">
                {badge}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {recentMissions.length === 0 ? (
        <p className="text-sm text-ivoire-dim">
          Vous n'avez pas encore consulté de mission —{" "}
          <Link href="/missions" className="text-or hover:underline">
            explorez le catalogue
          </Link>
          .
        </p>
      ) : null}

      {recentMissions.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-ivoire">Missions récentes</h2>
            <Link href="/missions" className="text-sm text-or hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recentMissions.map((mission) => (
              <Link key={mission.id} href={`/missions/${mission.slug}`}>
                <Card>
                  <p className="font-display text-base text-ivoire">{mission.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ivoire-dim">
                    <Clock size={13} /> {formatMinutes(mission.estimatedMinutes)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-xl text-ivoire">Recommandé pour vous</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {recommended.map((mission) => (
            <Link key={mission.id} href={`/missions/${mission.slug}`}>
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <Badge>{mission.level.toLowerCase()}</Badge>
                  {mission.isPremium && <Badge tone="gold">Premium</Badge>}
                </div>
                <p className="font-display text-base text-ivoire">{mission.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ivoire-dim">
                  {mission.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
