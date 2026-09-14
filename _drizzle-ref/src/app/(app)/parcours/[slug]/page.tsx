import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  FileText,
  Lock,
  Check,
  Crown,
  ShoppingBag,
  Sparkles,
  Wrench,
  UserPlus,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb } from "@/components/ui/misc";
import { PageTransition, Reveal } from "@/components/motion";
import { StartPathwayButton, FavoriteButton } from "@/components/app/actions";
import { getSession } from "@/lib/auth/session";
import { getPathwayBySlug } from "@/lib/queries/catalogue";
import { getPathwayProgress, getMissionStatuses, getFavorites } from "@/lib/queries/progress";
import { resolveAccess } from "@/lib/access";
import { formatMinutes, formatXof, LEVEL_LABELS } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pathway = await getPathwayBySlug(slug);
  return { title: pathway?.title ?? "Parcours" };
}

export default async function PathwayDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Fiche ouverte aux visiteurs : ils doivent pouvoir juger le parcours avant
  // de s'inscrire. Les missions, elles, restent fermées.
  const session = await getSession();
  const pathway = await getPathwayBySlug(slug);
  if (!pathway || !pathway.isPublished) notFound();

  const [access, progress, statuses, favorites] = await Promise.all([
    resolveAccess(session, {
      id: pathway.id,
      accessType: pathway.accessType,
      priceXof: pathway.priceXof,
    }),
    session ? getPathwayProgress(session.id, pathway.id) : Promise.resolve(null),
    session ? getMissionStatuses(session.id, pathway.id) : Promise.resolve(new Map()),
    session ? getFavorites(session.id) : Promise.resolve([]),
  ]);

  const isFavorite = favorites.some(
    (f) => f.entityType === "pathway" && f.entityId === pathway.id,
  );
  const percent = progress?.percent ?? 0;
  const currentIndex = pathway.missions.findIndex((m) => statuses.get(m.id) !== "completed");

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-7">
      <Breadcrumb
        items={[{ label: "Parcours", href: "/parcours" }, { label: pathway.title }]}
      />

      <header>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {pathway.accessType === "free" && <Badge tone="feuillage">Gratuit</Badge>}
          {pathway.accessType === "paid" && (
            <Badge tone="braise">{formatXof(pathway.priceXof)} · achat unique</Badge>
          )}
          {pathway.accessType === "premium" && <Badge tone="or">Premium</Badge>}
          <Badge tone="outline">{LEVEL_LABELS[pathway.level]}</Badge>
          {pathway.category && <Badge tone="outline">{pathway.category.name}</Badge>}
        </div>

        <h1 className="font-display text-2xl leading-tight text-ivoire sm:text-3xl">
          {pathway.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivoire-dim sm:text-base">
          {pathway.description}
        </p>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ivoire-dim">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Durée</dt>
            <Clock size={15} className="text-or" />
            <dd>{formatMinutes(pathway.durationMinutes)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Missions</dt>
            <Sparkles size={15} className="text-or" />
            <dd>
              {pathway.missions.length} mission{pathway.missions.length > 1 ? "s" : ""}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Niveau</dt>
            <Wrench size={15} className="text-or" />
            <dd>{LEVEL_LABELS[pathway.level]}</dd>
          </div>
        </dl>
      </header>

      {/* Résultat attendu — la promesse du parcours. */}
      <Reveal>
        <Card tone="feuillage">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-feuillage/15 text-feuillage-vif">
              <FileText size={20} strokeWidth={1.6} />
            </span>
            <div>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-feuillage-vif">
                Ce que tu obtiens
              </p>
              <CardTitle className="mt-1.5 text-base">{pathway.expectedResult}</CardTitle>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Progression ou appel à l'action */}
      {!session ? (
        <Card tone="or">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-or/12 text-or">
              <UserPlus size={20} strokeWidth={1.6} />
            </span>
            <div className="flex-1">
              <CardTitle className="text-base">Crée ton compte pour commencer</CardTitle>
              <CardDescription>
                {pathway.accessType === "free"
                  ? "Ce parcours est gratuit. Un compte suffit pour enregistrer ta progression et récupérer ton livrable."
                  : "Inscris-toi pour débloquer ce parcours et suivre ta progression mission par mission."}
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link href={`/inscription?suite=/parcours/${pathway.slug}`}>
                  <Button size="lg">Commencer</Button>
                </Link>
                <Link href={`/connexion?suite=/parcours/${pathway.slug}`}>
                  <Button variant="secondary" size="lg">
                    J'ai déjà un compte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : access.allowed ? (
        progress ? (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-sm text-ivoire">Ta progression</p>
              <span className="font-mono text-sm text-or">{percent}%</span>
            </div>
            <Progress value={percent} tone="braise" />
            <p className="mt-3 text-xs text-ivoire-dim">
              {progress.completedCount} mission{progress.completedCount > 1 ? "s" : ""} terminée
              {progress.completedCount > 1 ? "s" : ""} sur {progress.totalCount}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {currentIndex >= 0 && (
                <Link href={`/missions/${pathway.missions[currentIndex].slug}`}>
                  <Button>Continuer</Button>
                </Link>
              )}
              <FavoriteButton entityType="pathway" entityId={pathway.id} initial={isFavorite} />
            </div>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            <StartPathwayButton slug={pathway.slug} />
            <FavoriteButton entityType="pathway" entityId={pathway.id} initial={isFavorite} />
          </div>
        )
      ) : (
        <Card tone={access.reason === "needs_premium" ? "or" : "braise"}>
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-or/12 text-or">
              {access.reason === "needs_premium" ? <Crown size={20} /> : <ShoppingBag size={20} />}
            </span>
            <div className="flex-1">
              <CardTitle className="text-base">
                {access.reason === "needs_premium"
                  ? "Parcours réservé aux membres Premium"
                  : `Parcours à ${formatXof(pathway.priceXof)}`}
              </CardTitle>
              <CardDescription>
                {access.reason === "needs_premium"
                  ? "L'abonnement Premium ouvre ce parcours et l'ensemble du catalogue."
                  : "Un achat unique, et le parcours reste accessible. L'abonnement Premium l'inclut également."}
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {access.reason === "needs_purchase" && (
                  <Link href={`/achats?parcours=${pathway.slug}`}>
                    <Button variant="braise" icon={<ShoppingBag size={16} />}>
                      Acheter ce parcours
                    </Button>
                  </Link>
                )}
                <Link href="/premium">
                  <Button variant={access.reason === "needs_premium" ? "primary" : "secondary"} icon={<Crown size={16} />}>
                    Voir Premium
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* La trajectoire : les missions du parcours */}
      <section>
        <h2 className="mb-5 font-display text-lg text-ivoire">
          Les missions ({pathway.missions.length})
        </h2>

        <ol className="relative space-y-3 pl-1">
          <div className="trajectoire absolute left-[19px] top-4 h-[calc(100%-2rem)] w-px opacity-50" />
          {pathway.missions.map((mission, index) => {
            const status = statuses.get(mission.id);
            const done = status === "completed";
            const isCurrent = index === currentIndex;
            const locked = !session || !access.allowed;

            const content = (
              <div
                className={`flex-1 rounded-card border p-4 transition-all duration-200 ${
                  done
                    ? "border-feuillage/30 bg-feuillage/[0.06]"
                    : isCurrent
                      ? "border-or/45 bg-or/[0.05]"
                      : "border-ivoire/10 bg-noir-elevated"
                } ${!locked ? "hover:border-or/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-sm text-ivoire">{mission.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ivoire-dim">
                      {mission.objective}
                    </p>
                  </div>
                  {locked && <Lock size={15} className="shrink-0 text-ivoire-faint" />}
                </div>
                <p className="mt-3 flex flex-wrap items-center gap-3 text-[0.7rem] text-ivoire-faint">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {formatMinutes(mission.estimatedMinutes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={11} /> {mission.resultLabel}
                  </span>
                  {mission.aiAssist && (
                    <span className="flex items-center gap-1 text-or">
                      <Sparkles size={11} /> Assistance IA
                    </span>
                  )}
                </p>
              </div>
            );

            return (
              <li key={mission.id} className="relative flex items-start gap-4">
                <span
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                    done
                      ? "border-feuillage bg-feuillage text-ivoire"
                      : isCurrent
                        ? "border-or bg-or text-noir"
                        : "border-ivoire/20 bg-noir-elevated text-ivoire-faint"
                  }`}
                >
                  {done ? <Check size={16} strokeWidth={3} /> : index + 1}
                </span>
                {locked ? content : <Link href={`/missions/${mission.slug}`} className="flex flex-1">{content}</Link>}
              </li>
            );
          })}
        </ol>
      </section>
    </PageTransition>
  );
}
