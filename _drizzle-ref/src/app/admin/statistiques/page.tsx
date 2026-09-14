import type { Metadata } from "next";
import {
  Users,
  Route,
  Trophy,
  Wallet,
  UserPlus,
  Target,
  MessageSquare,
  Swords,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Stat, SectionHeading } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOverview, getTopPathways, getSignupTrend } from "@/lib/queries/admin";
import { getCommerceOverview, getRevenueTrend } from "@/lib/queries/commerce-admin";
import { getCommunityStats } from "@/lib/queries/community";
import { formatXof } from "@/lib/utils";

export const metadata: Metadata = { title: "Statistiques" };

export default async function AdminStatsPage() {
  await requireRole("admin", "/admin/statistiques");

  const [overview, topPathways, signups, commerce, revenue, community] = await Promise.all([
    getAdminOverview(),
    getTopPathways(8),
    getSignupTrend(),
    getCommerceOverview(),
    getRevenueTrend(14),
    getCommunityStats(),
  ]);

  const maxSignups = Math.max(1, ...signups.map((s) => s.value));
  const maxRevenue = Math.max(1, ...revenue.map((r) => r.total));
  const maxLearners = Math.max(1, ...topPathways.map((p) => p.learners));

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-7">
      <SectionHeading
        eyebrow="Pilotage"
        title="Statistiques"
        description="L'état réel du produit : audience, usage, communauté, revenus."
      />

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StaggerItem>
          <Stat
            label="Membres"
            value={overview.users}
            hint={`+${overview.newUsers} sur 30 jours`}
            icon={<Users size={19} />}
            tone="or"
          />
        </StaggerItem>
        <StaggerItem>
          <Stat
            label="Parcours en cours"
            value={overview.activePathways}
            icon={<Route size={19} />}
            tone="braise"
          />
        </StaggerItem>
        <StaggerItem>
          <Stat
            label="Résultats produits"
            value={overview.results}
            icon={<Trophy size={19} />}
            tone="feuillage"
          />
        </StaggerItem>
        <StaggerItem>
          <Stat
            label="Chiffre d'affaires"
            value={formatXof(overview.revenueXof)}
            icon={<Wallet size={19} />}
            tone="or"
          />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus size={17} className="text-or" /> Inscriptions (14 jours)
          </CardTitle>
          {signups.length === 0 ? (
            <p className="mt-4 text-sm text-ivoire-dim">Aucune inscription récente.</p>
          ) : (
            <div
              className="mt-6 flex h-32 items-end gap-1.5"
              role="img"
              aria-label="Histogramme des inscriptions quotidiennes"
            >
              {signups.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-mono text-[0.6rem] text-ivoire-faint">{point.value}</span>
                  <div
                    className="w-full rounded-t bg-feuillage-vif/70"
                    style={{ height: `${Math.max(4, (point.value / maxSignups) * 100)}%` }}
                    title={`${point.day} : ${point.value}`}
                  />
                  <span className="text-[0.55rem] text-ivoire-faint">{point.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet size={17} className="text-or" /> Revenus (14 jours)
          </CardTitle>
          {revenue.every((r) => r.total === 0) ? (
            <p className="mt-4 text-sm text-ivoire-dim">Aucune vente sur la période.</p>
          ) : (
            <div
              className="mt-6 flex h-32 items-end gap-1.5"
              role="img"
              aria-label="Histogramme des revenus quotidiens"
            >
              {revenue.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t bg-or/70"
                    style={{ height: `${Math.max(4, (point.total / maxRevenue) * 100)}%` }}
                    title={`${point.day} : ${formatXof(point.total)}`}
                  />
                  <span className="text-[0.55rem] text-ivoire-faint">{point.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Parcours les plus suivis</h2>
        <Card>
          {topPathways.length === 0 ? (
            <p className="text-sm text-ivoire-dim">Aucun parcours suivi.</p>
          ) : (
            <ul className="space-y-4">
              {topPathways.map((pathway) => {
                const rate =
                  pathway.learners === 0 ? 0 : (pathway.completed / pathway.learners) * 100;
                return (
                  <li key={pathway.id}>
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm text-ivoire">{pathway.title}</span>
                      <span className="flex shrink-0 items-center gap-2 font-mono text-xs">
                        <Badge
                          tone={
                            pathway.accessType === "free"
                              ? "feuillage"
                              : pathway.accessType === "premium"
                                ? "or"
                                : "braise"
                          }
                        >
                          {pathway.accessType === "free"
                            ? "Gratuit"
                            : pathway.accessType === "premium"
                              ? "Premium"
                              : "Payant"}
                        </Badge>
                        <span className="text-ivoire-dim">
                          {pathway.learners} inscrit{pathway.learners > 1 ? "s" : ""}
                        </span>
                        <span className="text-feuillage-vif">{rate.toFixed(0)} % terminé</span>
                      </span>
                    </div>
                    <Progress value={(pathway.learners / maxLearners) * 100} tone="or" />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target size={17} className="text-or" /> Contenu
          </CardTitle>
          <CardDescription>Ce que la plateforme propose.</CardDescription>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Parcours</dt>
              <dd className="font-mono text-ivoire">{overview.pathways}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Missions</dt>
              <dd className="font-mono text-ivoire">{overview.missions}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Résultats produits</dt>
              <dd className="font-mono text-ivoire">{overview.results}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare size={17} className="text-or" /> Communauté
          </CardTitle>
          <CardDescription>La vie du produit hors parcours.</CardDescription>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Discussions</dt>
              <dd className="font-mono text-ivoire">{community.topics}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Réponses</dt>
              <dd className="font-mono text-ivoire">{community.replies}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Signalements ouverts</dt>
              <dd className="font-mono text-braise-vif">{overview.openReports}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Tickets ouverts</dt>
              <dd className="font-mono text-braise-vif">{overview.openTickets}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2 text-base">
            <Swords size={17} className="text-or" /> Monétisation
          </CardTitle>
          <CardDescription>Conversion des membres.</CardDescription>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Acheteurs</dt>
              <dd className="font-mono text-ivoire">{commerce.buyers}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Abonnés Premium</dt>
              <dd className="font-mono text-or">{overview.premium}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Taux de conversion</dt>
              <dd className="font-mono text-ivoire">{commerce.conversionRate.toFixed(1)} %</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ivoire-dim">Panier moyen</dt>
              <dd className="font-mono text-ivoire">{formatXof(commerce.averageBasketXof)}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </PageTransition>
  );
}
