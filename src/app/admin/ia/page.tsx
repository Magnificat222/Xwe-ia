import type { Metadata } from "next";
import { Sparkles, Zap, AlertTriangle, ServerCog, Crown, Users } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat, SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { QuotaForm } from "@/components/admin/quota-form";
import { requireRole } from "@/lib/auth/guards";
import {
  getAiUsageStats,
  getAiQuotas,
  getAiProviderSplit,
  getAiDailyTrend,
} from "@/lib/queries/commerce-admin";

export const metadata: Metadata = { title: "Intelligence artificielle" };

const FEATURE_LABELS: Record<string, string> = {
  mission_assist: "Aide en mission",
  brainstorm: "Exploration d'idées",
  rephrase: "Reformulation",
  structure: "Structuration",
  analyze: "Analyse",
  document: "Génération de document",
  explain: "Explication",
};

const PROVIDER_LABELS: Record<string, string> = {
  offline: "Assistant local",
  gemini: "Gemini",
};

export default async function AdminAiPage() {
  await requireRole("admin", "/admin/ia");

  const [stats, quotas, providers, trend] = await Promise.all([
    getAiUsageStats(),
    getAiQuotas(),
    getAiProviderSplit(),
    getAiDailyTrend(14),
  ]);

  const free = quotas.filter((q) => q.plan === "free");
  const premium = quotas.filter((q) => q.plan === "premium");
  const maxDaily = Math.max(1, ...trend.map((t) => t.n));
  const failureRate = stats.calls === 0 ? 0 : (stats.failures / stats.calls) * 100;

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-7">
      <SectionHeading
        eyebrow="Plateforme"
        title="Intelligence artificielle"
        description="Consommation réelle et limites par formule. Les clés restent côté serveur."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Appels (30 j)" value={stats.calls} icon={<Sparkles size={18} />} tone="or" />
        <Stat
          label="Jetons consommés"
          value={(stats.inputTokens + stats.outputTokens).toLocaleString("fr-FR")}
          icon={<Zap size={18} />}
          tone="braise"
        />
        <Stat
          label="Taux d'échec"
          value={`${failureRate.toFixed(1)} %`}
          icon={<AlertTriangle size={18} />}
          tone={failureRate > 10 ? "braise" : "feuillage"}
        />
        <Stat
          label="Fonctions actives"
          value={quotas.filter((q) => q.isEnabled).length}
          icon={<ServerCog size={18} />}
          tone="feuillage"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="text-base">Appels par jour (14 jours)</CardTitle>
          {trend.every((t) => t.n === 0) ? (
            <p className="mt-4 text-sm text-ivoire-dim">Aucun appel sur la période.</p>
          ) : (
            <div
              className="mt-6 flex h-28 items-end gap-1.5"
              role="img"
              aria-label="Histogramme des appels IA quotidiens"
            >
              {trend.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t bg-or/70"
                    style={{ height: `${Math.max(3, (point.n / maxDaily) * 100)}%` }}
                    title={`${point.day} : ${point.n} appel(s)`}
                  />
                  <span className="text-[0.55rem] text-ivoire-faint">{point.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="text-base">Origine des réponses</CardTitle>
          <CardDescription>
            Un fort taux d'assistant local signale un fournisseur distant injoignable.
          </CardDescription>
          {providers.length === 0 ? (
            <p className="mt-4 text-sm text-ivoire-dim">Aucun appel enregistré.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {providers.map((row) => (
                <li key={row.provider} className="flex items-center justify-between text-sm">
                  <span className="text-ivoire-dim">
                    {PROVIDER_LABELS[row.provider] ?? row.provider}
                  </span>
                  <span className="font-mono text-ivoire">{row.n}</span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mb-2.5 mt-5 border-t border-ivoire/8 pt-4 text-xs uppercase tracking-wider text-ivoire-dim">
            Répartition par fonction
          </h3>
          {stats.byFeature.length === 0 ? (
            <p className="text-sm text-ivoire-dim">—</p>
          ) : (
            <ul className="space-y-2">
              {stats.byFeature.map((row) => (
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

      {[
        { title: "Formule gratuite", icon: Users, rows: free, tone: "default" as const },
        { title: "Formule Premium", icon: Crown, rows: premium, tone: "or" as const },
      ].map((group) => (
        <section key={group.title}>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-ivoire">
            <group.icon size={18} className="text-or" /> {group.title}
          </h2>
          {group.rows.length === 0 ? (
            <Card>
              <p className="text-sm text-ivoire-dim">Aucun quota défini.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {group.rows.map((quota) => (
                <Card key={quota.id} tone={quota.isEnabled ? group.tone : "default"}>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <CardTitle className="text-sm">
                      {FEATURE_LABELS[quota.feature] ?? quota.feature}
                    </CardTitle>
                    {!quota.isEnabled && <Badge tone="outline">Désactivée</Badge>}
                  </div>
                  <QuotaForm
                    id={quota.id}
                    dailyLimit={quota.dailyLimit}
                    monthlyLimit={quota.monthlyLimit}
                    isEnabled={quota.isEnabled}
                  />
                </Card>
              ))}
            </div>
          )}
        </section>
      ))}

      {stats.topUsers.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg text-ivoire">Plus gros consommateurs (30 j)</h2>
          <Card className="p-0">
            <ul>
              {stats.topUsers.map((row) => (
                <li
                  key={row.userId}
                  className="flex items-center justify-between gap-3 border-b border-ivoire/6 px-4 py-3 text-sm last:border-0"
                >
                  <span className="min-w-0 truncate text-ivoire-dim">{row.email ?? "—"}</span>
                  <span className="shrink-0 font-mono text-ivoire">{row.n} appels</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </PageTransition>
  );
}
