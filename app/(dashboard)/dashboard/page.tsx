import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { Clock, Target, Trophy, Medal, ArrowRight } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

const CHART_COLORS = ["#c9531f", "#c9a24b", "#3a7a52", "#8a7c68"];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const userId = session.user.id;

  const [
    totalMissions,
    completedCount,
    history,
    allMissions,
    completedProgress,
    quizAttempts,
  ] = await Promise.all([
    prisma.mission.count({ where: { isPublished: true } }),
    prisma.progress.count({ where: { userId, completed: true } }),
    prisma.history.findMany({
      where: { userId },
      include: { mission: true },
      orderBy: { viewedAt: "desc" },
      take: 3,
    }),
    prisma.mission.findMany({ where: { isPublished: true }, take: 6 }),
    prisma.progress.findMany({
      where: { userId, completed: true },
      include: { mission: { include: { category: true } } },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      select: { totalScore: true, badge: true },
    }),
  ]);

  const recentMissions = history.map((h) => h.mission);
  const recommended = allMissions.slice(0, 3);
  const percent = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  const byCategory = new Map<string, number>();
  for (const p of completedProgress) {
    const name = p.mission.category.name;
    byCategory.set(name, (byCategory.get(name) ?? 0) + 1);
  }
  const categorySegments = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value], i) => ({ label, value, color: CHART_COLORS[i] }));

  const quizPoints = quizAttempts.reduce((sum, a) => sum + a.totalScore, 0);
  const badgeCount = quizAttempts.filter((a) => a.badge).length;

  const firstName = session.user.name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pt-2">
      {/* Welcome hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 md:p-10"
        style={{ background: "linear-gradient(135deg, #c9531f 0%, #1e4530 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <svg className="h-full w-full" viewBox="0 0 400 200" fill="none">
            <path d="M0 160 L40 160 L40 120 L80 120 L80 160 L120 160" stroke="#f5efe4" strokeWidth="1" />
            <path d="M280 40 L320 40 L320 80 L360 80 L360 40 L400 40" stroke="#f5efe4" strokeWidth="1" />
          </svg>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ivoire/70">Tableau de bord</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">
          Bon retour{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 max-w-md text-sm text-ivoire/80">
          {completedCount > 0
            ? `Vous avez terminé ${completedCount} mission${completedCount > 1 ? "s" : ""}. Continuez sur votre lancée.`
            : "Votre première mission vous attend. Choisissez un objectif et commencez."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/missions">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ivoire px-5 py-2.5 text-sm font-medium text-noir">
              Continuer une mission <ArrowRight size={14} />
            </span>
          </Link>
          <Link href="/quiz">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ivoire/40 px-5 py-2.5 text-sm text-ivoire">
              Défier l'arène de quiz
            </span>
          </Link>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-braise/10 text-braise">
            <Target size={20} />
          </div>
          <div>
            <p className="font-display text-2xl text-ivoire">{completedCount}</p>
            <p className="text-xs text-ivoire-dim">Missions terminées</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-or/10 text-or">
            <Trophy size={20} />
          </div>
          <div>
            <p className="font-display text-2xl text-ivoire">{quizPoints}</p>
            <p className="text-xs text-ivoire-dim">Points de quiz</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-feuillage/15 text-feuillage">
            <Medal size={20} />
          </div>
          <div>
            <p className="font-display text-2xl text-ivoire">{badgeCount}</p>
            <p className="text-xs text-ivoire-dim">Badges de quiz</p>
          </div>
        </Card>
      </div>

      {/* Progress + activity */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-3">
          <p className="mb-5 font-display text-lg text-ivoire">Répartition par catégorie</p>
          <CategoryDonut
            segments={categorySegments}
            centerValue={`${percent}%`}
            centerLabel={`${completedCount}/${totalMissions}`}
          />
        </Card>

        <Card className="md:col-span-2">
          <p className="mb-4 font-display text-lg text-ivoire">Activité récente</p>
          {recentMissions.length === 0 ? (
            <p className="text-sm text-ivoire-dim">
              Vous n'avez pas encore consulté de mission —{" "}
              <Link href="/missions" className="text-or hover:underline">
                explorez le catalogue
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-3">
              {recentMissions.map((mission) => (
                <Link key={mission.id} href={`/missions/${mission.slug}`} className="block">
                  <p className="text-sm text-ivoire hover:text-or">{mission.title}</p>
                  <p className="flex items-center gap-1.5 text-xs text-ivoire-dim">
                    <Clock size={12} /> {formatMinutes(mission.estimatedMinutes)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recommended */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-ivoire">Recommandé pour vous</h2>
          <Link href="/missions" className="text-sm text-or hover:underline">
            Tout voir
          </Link>
        </div>
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
