import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Crown,
  Wallet,
  Users,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Stat, SectionHeading } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { requireRole } from "@/lib/auth/guards";
import {
  getCommerceOverview,
  getSalesByPathway,
  getRevenueTrend,
  getAiUsageStats,
} from "@/lib/queries/commerce-admin";
import { formatXof } from "@/lib/utils";

export const metadata: Metadata = { title: "Tableau commercial" };

const FEATURE_LABELS: Record<string, string> = {
  mission_assist: "Aide en mission",
  brainstorm: "Exploration",
  rephrase: "Reformulation",
  structure: "Structuration",
  analyze: "Analyse",
  document: "Documents",
  explain: "Explication",
};

export default async function AdminCommercePage() {
  await requireRole("admin", "/admin/commerce");

  const [overview, sales, trend, ai] = await Promise.all([
    getCommerceOverview(),
    getSalesByPathway(),
    getRevenueTrend(14),
    getAiUsageStats(),
  ]);

  const maxRevenue = Math.max(1, ...trend.map((t) => t.total));
  const maxSales = Math.max(1, ...sales.sold.map((s) => s.sales));

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-7">
      <SectionHeading
        eyebrow="Pilotage"
        title="Tableau commercial"
        description="Ce que le produit gagne, ce qui se vend, et ce qui ne se vend pas."
      />

      {overview.pendingPayments > 0 && (
        <Link href="/admin/commandes" className="block">
          <Card tone="or" interactive>
            <p className="flex items-center gap-2 text-sm text-ivoire">
              <AlertTriangle size={16} className="shrink-0 text-or" />
              {overview.pendingPayments} paiement{overview.pendingPayments > 1 ? "s" : ""} en
              attente de vérification.
            </p>
          </Card>
        </Link>
      )}

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StaggerItem>
          <Stat
            label="Chiffre d'affaires"
            value={formatXof(overview.revenueXof)}
            hint={`${formatXof(overview.revenueMonthXof)} sur 30 jours`}
            icon={<Wallet size={19} />}
            tone="or"
          />
        </StaggerItem>
        <StaggerItem>
          <Stat
            label="Ventes"
            value={overview.salesCount}
            hint={`${overview.salesMonthCount} sur 30 jours`}
            icon={<ShoppingBag size={19} />}
            tone="braise"
          />
        </StaggerItem>
        <StaggerItem>
          <Stat
            label="Panier moyen"
            value={formatXof(overview.averageBasketXof)}
            icon={<TrendingUp size={19} />}
            tone="feuillage"
          />
        </StaggerItem>
        <StaggerItem>
          <Stat
            label="Abonnés Premium"
            value={overview.premiumUsers}
            hint={formatXof(overview.premiumRevenueXof)}
            icon={<Crown size={19} />}
            tone="or"
          />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp size={17} className="text-or" /> Revenus (14 jours)
          </CardTitle>
          {trend.every((t) => t.total === 0) ? (
            <p className="mt-4 text-sm text-ivoire-dim">Aucune vente sur la période.</p>
          ) : (
            <div
              className="mt-6 flex h-36 items-end gap-1.5"
              role="img"
              aria-label="Histogramme des revenus quotidiens"
            >
              {trend.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-mono text-[0.6rem] text-ivoire-faint">
                    {point.count || ""}
                  </span>
                  <div
                    className="w-full rounded-t bg-or/70 transition-colors hover:bg-or"
                    style={{ height: `${Math.max(3, (point.total / maxRevenue) * 100)}%` }}
                    title={`${point.day} : ${formatXof(point.total)} (${point.count} vente${point.count > 1 ? "s" : ""})`}
                  />
                  <span className="text-[0.55rem] text-ivoire-faint">{point.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="text-base">Conversion</CardTitle>
          <CardDescription>Ce que devient un visiteur inscrit.</CardDescription>
          <div className="mt-5 space-y-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-ivoire-dim">Membres ayant acheté</span>
                <span className="font-mono text-or">{overview.conversionRate.toFixed(1)} %</span>
              </div>
              <Progress value={overview.conversionRate} tone="braise" />
              <p className="mt-1 text-[0.7rem] text-ivoire-faint">
                {overview.buyers} sur {overview.totalUsers} membres
              </p>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-ivoire-dim">Conversion Premium</span>
                <span className="font-mono text-or">{overview.premiumRate.toFixed(1)} %</span>
              </div>
              <Progress value={overview.premiumRate} tone="or" />
            </div>

            <dl className="space-y-2.5 border-t border-ivoire/8 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ivoire-dim">Revenus parcours</dt>
                <dd className="font-mono text-ivoire">{formatXof(overview.pathwayRevenueXof)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ivoire-dim">Revenus Premium</dt>
                <dd className="font-mono text-ivoire">{formatXof(overview.premiumRevenueXof)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ivoire-dim">Paiements confirmés</dt>
                <dd className="font-mono text-feuillage-vif">{overview.confirmedPayments}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ivoire-dim">Paiements refusés</dt>
                <dd className="font-mono text-braise-vif">{overview.rejectedPayments}</dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Ventes par parcours</h2>
        <Card>
          {sales.sold.length === 0 ? (
            <p className="text-sm text-ivoire-dim">Aucune vente enregistrée.</p>
          ) : (
            <ul className="space-y-4">
              {sales.sold.map((row) => (
                <li key={row.pathwayId}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm text-ivoire">{row.title}</span>
                    <span className="shrink-0 font-mono text-xs text-or">
                      {row.sales} vente{row.sales > 1 ? "s" : ""} · {formatXof(row.revenue)}
                    </span>
                  </div>
                  <Progress value={(row.sales / maxSales) * 100} tone="or" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {sales.unsold.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-lg text-ivoire">Parcours payants sans vente</h2>
          <p className="mb-4 text-sm text-ivoire-dim">
            Souvent le signe d'un prix mal calibré ou d'une promesse peu claire.
          </p>
          <Card className="p-0">
            <ul>
              {sales.unsold.map((row) => (
                <li
                  key={row.pathwayId}
                  className="flex items-center justify-between gap-3 border-b border-ivoire/6 px-4 py-3 last:border-0"
                >
                  <span className="min-w-0 truncate text-sm text-ivoire">{row.title}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs text-ivoire-faint">
                      {formatXof(row.priceXof)}
                    </span>
                    <Link href={`/admin/prix?parcours=${row.slug}`}>
                      <Badge tone="outline">Ajuster</Badge>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Consommation IA (30 jours)</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles size={17} className="text-or" /> Volume
            </CardTitle>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ivoire-dim">Appels</dt>
                <dd className="font-mono text-ivoire">{ai.calls}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ivoire-dim">Jetons en entrée</dt>
                <dd className="font-mono text-ivoire">{ai.inputTokens.toLocaleString("fr-FR")}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ivoire-dim">Jetons en sortie</dt>
                <dd className="font-mono text-ivoire">{ai.outputTokens.toLocaleString("fr-FR")}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ivoire-dim">Échecs</dt>
                <dd className="font-mono text-braise-vif">{ai.failures}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users size={17} className="text-or" /> Répartition
            </CardTitle>
            {ai.byFeature.length === 0 ? (
              <p className="mt-4 text-sm text-ivoire-dim">Aucun appel enregistré.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {ai.byFeature.map((row) => (
                  <li key={row.feature} className="flex items-center justify-between text-sm">
                    <span className="text-ivoire-dim">
                      {FEATURE_LABELS[row.feature] ?? row.feature}
                    </span>
                    <span className="font-mono text-ivoire">{row.n}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </PageTransition>
  );
}
