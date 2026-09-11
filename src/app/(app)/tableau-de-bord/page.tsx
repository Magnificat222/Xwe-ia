import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Clock,
  Crown,
  FileText,
  Flame,
  PlayCircle,
  Route,
  Star,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, ProgressRing } from "@/components/ui/progress";
import { Stat, EmptyState, SectionHeading } from "@/components/ui/misc";
import { Reveal, Stagger, StaggerItem, PageTransition } from "@/components/motion";
import { requireUser } from "@/lib/auth/guards";
import {
  getDashboardStats,
  getNextMission,
  getUserPathways,
  getUserResults,
  getNotifications,
  getCurrentGoal,
  getFavorites,
} from "@/lib/queries/progress";
import { getPathways } from "@/lib/queries/catalogue";
import { formatMinutes, formatRelative } from "@/lib/utils";
import { resolveIcon } from "@/lib/icons";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const session = await requireUser("/tableau-de-bord");

  const [stats, next, myPathways, results, notifications, goal, favorites, suggestions] =
    await Promise.all([
      getDashboardStats(session.id),
      getNextMission(session.id),
      getUserPathways(session.id),
      getUserResults(session.id, 4),
      getNotifications(session.id, 4),
      getCurrentGoal(session.id),
      getFavorites(session.id),
      getPathways({ limit: 3 }),
    ]);

  const firstName = (session.displayName ?? session.name ?? "").split(" ")[0];
  const inProgress = myPathways.filter((p) => p.status === "in_progress");
  const overall =
    myPathways.length > 0
      ? Math.round(myPathways.reduce((sum, p) => sum + p.percent, 0) / myPathways.length)
      : 0;
  const GoalIcon = goal
    ? (resolveIcon(goal.icon, Target))
    : Target;

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      {/* Bandeau : signature visuelle du dashboard Xwé IA. */}
      <section className="relative overflow-hidden rounded-panel p-6 sm:p-8">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, var(--color-braise) 0%, var(--color-feuillage-soft) 55%, var(--color-feuillage) 100%)",
          }}
        />
        <div className="motif-circuit absolute inset-0 -z-10 opacity-[0.12]" aria-hidden />

        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ivoire/70">
          Tableau de bord
        </p>
        <h1 className="mt-2 font-display text-2xl text-ivoire sm:text-3xl">
          Bonjour{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-ivoire/85">
          {next
            ? `Prochaine étape : « ${next.mission.title} » dans le parcours ${next.pathway.title}.`
            : stats.missionsCompleted > 0
              ? "Tu as terminé tes missions en cours. Prêt pour un nouvel objectif ?"
              : "Choisis un objectif et commence ton premier parcours."}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {next ? (
            <Link href={`/missions/${next.mission.slug}`}>
              <Button icon={<PlayCircle size={16} />}>Continuer ma mission</Button>
            </Link>
          ) : (
            <Link href="/objectifs">
              <Button icon={<Target size={16} />}>Choisir un objectif</Button>
            </Link>
          )}
          <Link href="/parcours">
            <Button variant="secondary">Explorer les parcours</Button>
          </Link>
        </div>
      </section>

      {/* Objectif actuel + progression générale */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <Card className="h-full">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-or/10 text-or">
                <GoalIcon size={22} strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-or">
                  Objectif actuel
                </p>
                <CardTitle className="mt-1.5 text-base">
                  {goal?.title ?? "Aucun objectif défini"}
                </CardTitle>
                <CardDescription>
                  {goal?.tagline ?? "Choisis un objectif pour orienter tes parcours."}
                </CardDescription>
                <Link
                  href="/objectifs"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-or transition-colors hover:text-or-vif"
                >
                  {goal ? "Changer d'objectif" : "Choisir un objectif"} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.06}>
          <Card className="flex h-full items-center gap-5">
            <ProgressRing value={overall} size={96} tone="or">
              <span className="font-display text-xl text-ivoire">{overall}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="font-display text-sm text-ivoire">Progression générale</p>
              <p className="mt-1 text-xs leading-relaxed text-ivoire-dim">
                {myPathways.length > 0
                  ? `${inProgress.length} parcours en cours · ${stats.pathwaysCompleted} terminé${stats.pathwaysCompleted > 1 ? "s" : ""}`
                  : "Aucun parcours démarré"}
              </p>
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Statistiques */}
      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StaggerItem>
          <Stat label="Missions terminées" value={stats.missionsCompleted} icon={<Target size={19} />} tone="braise" />
        </StaggerItem>
        <StaggerItem>
          <Stat label="Parcours terminés" value={stats.pathwaysCompleted} icon={<Flame size={19} />} tone="or" />
        </StaggerItem>
        <StaggerItem>
          <Stat label="Résultats produits" value={stats.results} icon={<Trophy size={19} />} tone="feuillage" />
        </StaggerItem>
        <StaggerItem>
          <Stat label="Points d'arène" value={stats.arenaPoints} icon={<Swords size={19} />} tone="or" />
        </StaggerItem>
      </Stagger>

      {/* Parcours en cours */}
      <section>
        <SectionHeading
          eyebrow="En cours"
          title="Tes parcours"
          action={
            <Link href="/parcours">
              <Button variant="ghost" size="sm" iconRight={<ArrowRight size={15} />}>
                Tout voir
              </Button>
            </Link>
          }
        />
        <div className="mt-5">
          {inProgress.length === 0 ? (
            <EmptyState
              icon={<Route size={22} />}
              title="Aucun parcours en cours"
              description="Choisis un objectif : Xwé IA te propose le parcours qui y mène."
              action={
                <Link href="/objectifs">
                  <Button icon={<Target size={16} />}>Choisir un objectif</Button>
                </Link>
              }
            />
          ) : (
            <Stagger className="grid gap-3 sm:grid-cols-2">
              {inProgress.map((item) => (
                <StaggerItem key={item.id}>
                  <Link href={`/parcours/${item.pathway.slug}`}>
                    <Card interactive className="h-full">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <CardTitle className="text-base leading-snug">{item.pathway.title}</CardTitle>
                        <Badge tone="or">{item.percent}%</Badge>
                      </div>
                      <Progress value={item.percent} tone="braise" />
                      <p className="mt-3 flex items-center justify-between text-xs text-ivoire-dim">
                        <span>
                          {item.completedCount}/{item.totalCount} missions
                        </span>
                        <span>{formatRelative(item.lastActivityAt)}</span>
                      </p>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {/* Prochaine mission mise en avant */}
      {next && (
        <Reveal>
          <Card tone="braise">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-braise-vif">
                  Prochaine mission
                </p>
                <CardTitle className="mt-1.5 text-base">{next.mission.title}</CardTitle>
                <CardDescription className="line-clamp-2">{next.mission.objective}</CardDescription>
                <p className="mt-2.5 flex items-center gap-3 text-xs text-ivoire-dim">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatMinutes(next.mission.estimatedMinutes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={12} /> {next.mission.resultLabel}
                  </span>
                </p>
              </div>
              <Link href={`/missions/${next.mission.slug}`} className="shrink-0">
                <Button variant="braise" iconRight={<ArrowRight size={16} />}>
                  Démarrer
                </Button>
              </Link>
            </div>
          </Card>
        </Reveal>
      )}

      {/* Résultats récents + activité */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <CardTitle className="text-base">Résultats récents</CardTitle>
              <Link href="/resultats" className="text-xs text-or hover:underline">
                Tout voir
              </Link>
            </div>
            {results.length === 0 ? (
              <p className="text-sm text-ivoire-dim">
                Tes livrables apparaîtront ici dès que tu auras validé ta première mission.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {results.map((result) => (
                  <li key={result.id}>
                    <Link
                      href={`/resultats/${result.id}`}
                      className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-ivoire/5"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-feuillage/12 text-feuillage-vif">
                        <FileText size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ivoire">{result.title}</span>
                        <span className="block text-xs text-ivoire-faint">
                          {formatRelative(result.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.06}>
          <Card className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <CardTitle className="text-base">Activité récente</CardTitle>
              <Link href="/notifications" className="text-xs text-or hover:underline">
                Notifications
              </Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-ivoire-dim">Rien de nouveau pour l'instant.</p>
            ) : (
              <ul className="space-y-2.5">
                {notifications.map((notification) => (
                  <li key={notification.id} className="flex items-start gap-3">
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-or/10 text-or">
                      <Bell size={13} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-ivoire">{notification.title}</span>
                      <span className="block text-xs text-ivoire-faint">
                        {formatRelative(notification.createdAt)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Reveal>
      </div>

      {/* Raccourcis */}
      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { href: "/favoris", label: "Favoris", value: favorites.length, icon: Star },
          { href: "/resultats", label: "Mes résultats", value: stats.results, icon: Trophy },
          { href: "/arene", label: "Arène", value: stats.arenaPoints, icon: Swords },
          {
            href: "/premium",
            label: session.plan === "premium" ? "Premium actif" : "Passer Premium",
            value: session.plan === "premium" ? "✓" : "—",
            icon: Crown,
          },
        ].map((item) => (
          <StaggerItem key={item.href}>
            <Link href={item.href}>
              <Card interactive className="flex h-full items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ivoire/6 text-or">
                  <item.icon size={18} strokeWidth={1.6} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-base text-ivoire">{item.value}</span>
                  <span className="block truncate text-xs text-ivoire-dim">{item.label}</span>
                </span>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Suggestions */}
      {inProgress.length === 0 && suggestions.length > 0 && (
        <section>
          <SectionHeading eyebrow="Suggestions" title="Des parcours pour démarrer" />
          <Stagger className="mt-5 grid gap-3 sm:grid-cols-3">
            {suggestions.map((pathway) => (
              <StaggerItem key={pathway.id}>
                <Link href={`/parcours/${pathway.slug}`}>
                  <Card interactive className="h-full">
                    <div className="mb-2 flex items-center gap-2">
                      {pathway.accessType === "free" && <Badge tone="feuillage">Gratuit</Badge>}
                      {pathway.accessType === "premium" && <Badge tone="or">Premium</Badge>}
                      {pathway.accessType === "paid" && <Badge tone="braise">Payant</Badge>}
                    </div>
                    <CardTitle className="text-sm leading-snug">{pathway.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {pathway.summary}
                    </CardDescription>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </PageTransition>
  );
}
