import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCreditSummary } from "@/lib/credits";
import { getPaymentConfig, listUserPaymentRequests } from "@/lib/payments";
import { getSiteSettings } from "@/lib/settings";
import { PaymentForm } from "@/components/credits/payment-form";

const STATUS = { PENDING: "En attente", APPROVED: "Validé", REJECTED: "Refusé" } as const;

export default async function CreditsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/credits");
  const userId = session.user.id;

  const [summary, config, requests, settings] = await Promise.all([
    getCreditSummary(userId, 20),
    getPaymentConfig(),
    listUserPaymentRequests(userId),
    getSiteSettings(),
  ]);

  const canPay = config.enabled && config.providers.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Xwé Crédits</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Mes crédits</h1>
      </div>

      <Card>
        <p className="text-sm text-ivoire-dim">Solde</p>
        <p className="font-display text-4xl text-or">{summary.balance}</p>
        <p className="mt-1 text-xs text-ivoire-dim">Les crédits débloquent les parcours payants. Ils sont distincts du Premium.</p>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg text-ivoire">Acheter</h2>
        {canPay ? (
          <PaymentForm config={config} premiumPeriodDays={settings.premiumDurationDays} />
        ) : (
          <p className="text-sm text-ivoire-dim">Les achats ne sont pas encore ouverts. Revenez bientôt.</p>
        )}
      </Card>

      {requests.length > 0 && (
        <Card>
          <h2 className="mb-3 font-display text-lg text-ivoire">Mes demandes de paiement</h2>
          <ul className="space-y-2 text-sm">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-ivoire">
                <span>
                  {r.purpose === "PREMIUM" ? "Premium" : `${r.creditAmount} crédits`} · {r.amountXof.toLocaleString("fr-FR")} FCFA
                  <span className="ml-2 text-xs text-ivoire-dim">{r.createdAt.toLocaleDateString("fr-FR")}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone={r.status === "APPROVED" ? "feuillage" : "default"}>{STATUS[r.status]}</Badge>
                  {r.rejectionReason && <span className="text-xs text-ivoire-dim">{r.rejectionReason}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="mb-3 font-display text-lg text-ivoire">Historique</h2>
        {summary.transactions.length === 0 ? (
          <p className="text-sm text-ivoire-dim">Aucune opération pour l'instant.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {summary.transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-ivoire">
                <span>
                  {t.description ?? t.type}
                  <span className="ml-2 text-xs text-ivoire-dim">{t.createdAt.toLocaleDateString("fr-FR")}</span>
                </span>
                <span className={t.amount > 0 ? "text-or" : "text-ivoire-dim"}>{t.amount > 0 ? "+" : ""}{t.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
