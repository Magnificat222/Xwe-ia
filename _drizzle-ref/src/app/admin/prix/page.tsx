import type { Metadata } from "next";
import { Tag, Crown, History } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { PriceForm, PremiumPriceForm } from "@/components/admin/price-forms";
import { requireRole } from "@/lib/auth/guards";
import { getAdminPathways } from "@/lib/queries/admin";
import { getPriceHistory } from "@/lib/queries/commerce-admin";
import { getSettings } from "@/lib/queries/catalogue";
import { formatXof, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Prix" };

export default async function AdminPricesPage() {
  await requireRole("admin", "/admin/prix");

  const [pathways, history, settings] = await Promise.all([
    getAdminPathways(),
    getPriceHistory(30),
    getSettings(),
  ]);

  const paid = pathways.filter((p) => p.accessType === "paid");
  const others = pathways.filter((p) => p.accessType !== "paid");

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-7">
      <SectionHeading
        eyebrow="Monétisation"
        title="Prix"
        description="Les tarifs vivent en base : aucune modification ne demande de toucher au code."
      />

      <Card tone="or">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown size={17} className="text-or" /> Abonnement Premium
        </CardTitle>
        <CardDescription>Prix mensuel, appliqué immédiatement aux nouvelles commandes.</CardDescription>
        <div className="mt-4">
          <PremiumPriceForm currentPrice={settings?.premiumPriceXof ?? 5500} />
        </div>
      </Card>

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Parcours payants</h2>
        {paid.length === 0 ? (
          <Card>
            <p className="text-sm text-ivoire-dim">Aucun parcours en vente à l'unité.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {paid.map((pathway) => (
              <Card key={pathway.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-sm">{pathway.title}</CardTitle>
                    <p className="mt-1 text-xs text-ivoire-faint">
                      {pathway.missionCount} mission{pathway.missionCount > 1 ? "s" : ""} ·{" "}
                      {pathway.learners} inscrit{pathway.learners > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge tone="braise">{formatXof(pathway.priceXof)}</Badge>
                </div>
                <div className="mt-4">
                  <PriceForm pathwayId={pathway.id} currentPrice={pathway.priceXof} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-lg text-ivoire">Autres parcours</h2>
          <p className="mb-4 text-sm text-ivoire-dim">
            Gratuits ou réservés au Premium : leur prix ne s'applique pas. Change leur type d'accès
            depuis la page Parcours pour les mettre en vente.
          </p>
          <Card className="p-0">
            <ul>
              {others.map((pathway) => (
                <li
                  key={pathway.id}
                  className="flex items-center justify-between gap-3 border-b border-ivoire/6 px-4 py-3 last:border-0"
                >
                  <span className="min-w-0 truncate text-sm text-ivoire">{pathway.title}</span>
                  <Badge tone={pathway.accessType === "free" ? "feuillage" : "or"}>
                    {pathway.accessType === "free" ? "Gratuit" : "Premium"}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-ivoire">
          <History size={18} className="text-or" /> Historique des modifications
        </h2>
        <Card className="p-0">
          {history.length === 0 ? (
            <p className="px-4 py-5 text-sm text-ivoire-dim">Aucune modification enregistrée.</p>
          ) : (
            <ul>
              {history.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-ivoire/6 px-4 py-3 text-xs last:border-0"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Tag size={13} className="shrink-0 text-or" />
                    <span className="truncate text-ivoire">
                      {row.scope === "premium" ? "Abonnement Premium" : (row.pathwayTitle ?? "—")}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 font-mono">
                    <span className="text-ivoire-faint line-through">
                      {formatXof(row.oldPriceXof)}
                    </span>
                    <span className="text-or">{formatXof(row.newPriceXof)}</span>
                    <span className="text-ivoire-faint">{formatRelative(row.createdAt)}</span>
                  </span>
                  {row.reason && (
                    <p className="w-full text-[0.7rem] text-ivoire-faint">{row.reason}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </PageTransition>
  );
}
