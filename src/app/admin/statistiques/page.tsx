import type { Metadata } from "next";
import { Users, Crown, Route, Trophy, CreditCard, ListChecks, TrendingUp } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Stat, SectionHeading } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOverview, getTopPathways, getSignupTrend, getAuditLogs } from "@/lib/queries/admin";
import { formatXof, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Statistiques" };

export default async function AdminStatsPage() {
  await requireRole("admin", "/admin/statistiques");
  const [overview, topPathways, trend, logs] = await Promise.all([
    getAdminOverview(),
    getTopPathways(10),
    getSignupTrend(),
    getAuditLogs(30),
  ]);

  const maxTrend = Math.max(1, ...trend.map((point) => point.value));
  const maxLearners = Math.max(1, ...topPathways.map((pathway) => pathway.learners));
  const conversion = overview.users > 0 ? (overview.premium / overview.users) * 100 : 0;
  const completionRate =
    overview.missions > 0 ? Math.min(100, (overview.results / overview.missions) * 100) : 0;

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-7">
      <SectionHeading
        eyebrow="Pilotage"
        title="Statistiques"
        description="Les chiffres qui disent si le produit remplit sa promesse."
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
            label="Abonnés Premium"
            value={overview.premium}
            hint={`${conversion.toFixed(1)} % des membres`}
            icon={<Crown size={19} />}
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
            label="Revenus"
            value={formatXof(overview.revenueXof)}
            icon={<CreditCard size={19} />}
            tone="or"
          />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp size={17} className="text-or" /> Inscriptions (14 jours)
          </CardTitle>
          {trend.length === 0 ? (
            <p className="mt-4 text-sm text-ivoire-dim">Aucune inscription sur la période.</p>
          ) : (
            <div
              className="mt-6 flex h-36 items-end gap-1.5"
              role="img"
              aria-label="Histogramme des inscriptions"
            >
              {trend.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-mono text-[0.6rem] text-ivoire-faint">{point.value}</span>
                  <div
                    className="w-full rounded-t bg-braise/70 transition-colors hover:bg-braise"
                    style={{ height: `${Math.max(4, (point.value / maxTrend) * 100)}%` }}
                    title={`${point.day} : ${point.value}`}
                  />
                  <span className="text-[0.55rem] text-ivoire-faint">{point.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="text-base">Indicateurs clés</CardTitle>
          <CardDescription>Ce qui mesure la santé du produit.</CardDescription>
          <div className="mt-5 space-y-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-ivoire-dim">Conversion Premium</span>
                <span className="font-mono text-or">{conversion.toFixed(1)} %</span>
              </div>
              <Progress value={conversion} tone="or" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-ivoire-dim">Taux de production de résultats</span>
                <span className="font-mono text-or">{completionRate.toFixed(1)} %</span>
              </div>
              <Progress value={completionRate} tone="feuillage" />
            </div>
            <dl className="space-y-2.5 border-t border-ivoire/8 pt-4">
              {[
                { label: "Parcours publiés", value: overview.pathways, icon: Route },
                { label: "Missions publiées", value: overview.missions, icon: ListChecks },
                { label: "Parcours en cours", value: overview.activePathways, icon: Trophy },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm text-ivoire-dim">
                    <row.icon size={14} className="text-or" /> {row.label}
                  </dt>
                  <dd className="font-mono text-sm text-ivoire">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
      </div>

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Performance des parcours</h2>
        <Card>
          {topPathways.length === 0 ? (
            <p className="text-sm text-ivoire-dim">Aucune donnée.</p>
          ) : (
            <ul className="space-y-4">
              {topPathways.map((pathway) => (
                <li key={pathway.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm text-ivoire">{pathway.title}</span>
                    <span className="shrink-0 font-mono text-xs text-ivoire-faint">
                      {pathway.learners} inscrits · {pathway.completed} terminés
                    </span>
                  </div>
                  <Progress
                    value={(pathway.learners / maxLearners) * 100}
                    tone={
                      pathway.accessType === "free"
                        ? "feuillage"
                        : pathway.accessType === "premium"
                          ? "or"
                          : "braise"
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Journal d'audit complet</h2>
        <Card className="p-0">
          {logs.length === 0 ? (
            <p className="px-4 py-5 text-sm text-ivoire-dim">Aucune action enregistrée.</p>
          ) : (
            <ul>
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between gap-3 border-b border-ivoire/6 px-4 py-2.5 text-xs last:border-0"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Badge tone="outline">{log.entity}</Badge>
                    <span className="truncate font-mono text-or">{log.action}</span>
                    <span className="truncate text-ivoire-dim">
                      {log.actorEmail ?? "système"}
                    </span>
                  </span>
                  <span className="shrink-0 text-ivoire-faint">{formatRelative(log.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </PageTransition>
  );
}
