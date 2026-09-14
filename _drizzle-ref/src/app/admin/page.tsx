import type { Metadata } from "next";
import Link from "next/link";
import { Users, Crown, Route, CreditCard, Flag, LifeBuoy, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat, SectionHeading } from "@/components/ui/misc";
import { Stagger, StaggerItem, PageTransition } from "@/components/motion";
import { getAdminOverview, getTopPathways, getSignupTrend, getAuditLogs } from "@/lib/queries/admin";
import { formatXof, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Vue d'ensemble" };

export default async function AdminHomePage() {
  const [overview, topPathways, trend, logs] = await Promise.all([
    getAdminOverview(),
    getTopPathways(),
    getSignupTrend(),
    getAuditLogs(8),
  ]);

  const maxTrend = Math.max(1, ...trend.map((point) => point.value));
  const alerts = [
    {
      href: "/admin/paiements",
      label: "Paiements en attente",
      value: overview.pendingPayments,
      icon: CreditCard,
    },
    { href: "/admin/signalements", label: "Signalements ouverts", value: overview.openReports, icon: Flag },
    { href: "/admin/support", label: "Tickets ouverts", value: overview.openTickets, icon: LifeBuoy },
  ].filter((alert) => alert.value > 0);

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-7">
      <SectionHeading
        eyebrow="Administration"
        title="Vue d'ensemble"
        description="L'état de la plateforme en un coup d'œil."
      />

      {alerts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {alerts.map((alert) => (
            <Link key={alert.href} href={alert.href}>
              <Card interactive tone="braise" className="flex items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-braise/15 text-braise-vif">
                  <alert.icon size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-base text-ivoire">{alert.value}</span>
                  <span className="block truncate text-xs text-ivoire-dim">{alert.label}</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}

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
          <Stat label="Abonnés Premium" value={overview.premium} icon={<Crown size={19} />} tone="braise" />
        </StaggerItem>
        <StaggerItem>
          <Stat
            label="Parcours en cours"
            value={overview.activePathways}
            icon={<Route size={19} />}
            tone="feuillage"
          />
        </StaggerItem>
        <StaggerItem>
          <Stat
            label="Revenus encaissés"
            value={formatXof(overview.revenueXof)}
            icon={<CreditCard size={19} />}
            tone="or"
          />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp size={17} className="text-or" /> Inscriptions (14 jours)
          </CardTitle>
          {trend.length === 0 ? (
            <p className="mt-4 text-sm text-ivoire-dim">Aucune inscription sur la période.</p>
          ) : (
            <div className="mt-6 flex h-32 items-end gap-1.5" role="img" aria-label="Histogramme des inscriptions sur 14 jours">
              {trend.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-1.5">
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
          <CardTitle className="text-base">Contenu publié</CardTitle>
          <dl className="mt-4 space-y-3">
            {[
              { label: "Parcours", value: overview.pathways },
              { label: "Missions", value: overview.missions },
              { label: "Résultats produits", value: overview.results },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <dt className="text-sm text-ivoire-dim">{row.label}</dt>
                <dd className="font-mono text-sm text-ivoire">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-ivoire">Parcours les plus suivis</h2>
          <Link href="/admin/parcours" className="flex items-center gap-1 text-xs text-or hover:underline">
            Gérer <ArrowRight size={12} />
          </Link>
        </div>
        <Card className="p-0">
          <ul>
            {topPathways.map((pathway) => (
              <li
                key={pathway.id}
                className="flex items-center justify-between gap-3 border-b border-ivoire/6 px-4 py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ivoire">{pathway.title}</p>
                  <p className="text-xs text-ivoire-faint">
                    {pathway.learners} inscrits · {pathway.completed} terminés
                  </p>
                </div>
                <Badge
                  tone={
                    pathway.accessType === "free"
                      ? "feuillage"
                      : pathway.accessType === "premium"
                        ? "or"
                        : "braise"
                  }
                >
                  {pathway.accessType}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Journal d'audit</h2>
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
                  <span className="min-w-0 truncate">
                    <span className="font-mono text-or">{log.action}</span>{" "}
                    <span className="text-ivoire-dim">
                      sur {log.entity} par {log.actorEmail ?? "système"}
                    </span>
                  </span>
                  <span className="shrink-0 text-ivoire-faint">
                    {formatRelative(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </PageTransition>
  );
}
