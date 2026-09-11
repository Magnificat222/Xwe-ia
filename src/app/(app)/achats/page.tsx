import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, ShoppingBag, Crown, Check, Clock, XCircle } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, SectionHeading } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { CheckoutButton } from "@/components/app/checkout";
import { requireUser } from "@/lib/auth/guards";
import { getUserPurchases, getUserPayments, getActiveSubscription } from "@/lib/queries/commerce";
import { getPathwayBySlug } from "@/lib/queries/catalogue";
import { formatXof, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mes achats" };

const STATUS: Record<string, { label: string; tone: "or" | "feuillage" | "braise" | "outline"; icon: typeof Check }> = {
  completed: { label: "Payé", tone: "feuillage", icon: Check },
  pending: { label: "En attente", tone: "or", icon: Clock },
  failed: { label: "Échoué", tone: "braise", icon: XCircle },
  refunded: { label: "Remboursé", tone: "outline", icon: XCircle },
};

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ parcours?: string }>;
}) {
  const session = await requireUser("/achats");
  const { parcours } = await searchParams;

  const [purchases, payments, subscription, pending] = await Promise.all([
    getUserPurchases(session.id),
    getUserPayments(session.id),
    getActiveSubscription(session.id),
    parcours ? getPathwayBySlug(parcours) : Promise.resolve(null),
  ]);

  const alreadyOwned = pending
    ? purchases.some((purchase) => purchase.pathwayId === pending.id)
    : false;

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-8">
      <SectionHeading
        eyebrow="Ton compte"
        title="Mes achats"
        description="Tes parcours achetés, ton abonnement et l'historique de tes paiements."
      />

      {/* Achat en cours, arrivé depuis une page parcours. */}
      {pending && !alreadyOwned && pending.accessType === "paid" && (
        <Card tone="braise">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-braise-vif">
            Achat en cours
          </p>
          <CardTitle className="mt-2 text-base">{pending.title}</CardTitle>
          <CardDescription>{pending.expectedResult}</CardDescription>
          <div className="mt-5">
            <CheckoutButton
              kind="pathway"
              targetId={pending.id}
              amountXof={pending.priceXof}
              label="Acheter ce parcours"
            />
          </div>
        </Card>
      )}

      <Card tone={session.plan === "premium" ? "or" : "default"}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown size={17} className="text-or" /> Abonnement Premium
            </CardTitle>
            <CardDescription>
              {session.plan === "premium"
                ? subscription?.currentPeriodEnd
                  ? `Actif jusqu'au ${formatDate(subscription.currentPeriodEnd)}.`
                  : "Actif."
                : "Tu n'es pas abonné. Le catalogue complet est accessible avec Premium."}
            </CardDescription>
          </div>
          <Link href="/premium" className="shrink-0">
            <Button variant={session.plan === "premium" ? "ghost" : "primary"} size="sm">
              {session.plan === "premium" ? "Gérer" : "Découvrir Premium"}
            </Button>
          </Link>
        </div>
      </Card>

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Parcours achetés</h2>
        {purchases.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={22} />}
            title="Aucun achat"
            description="Les parcours que tu achètes à l'unité apparaîtront ici, accessibles à vie."
            action={
              <Link href="/parcours">
                <Button>Voir les parcours</Button>
              </Link>
            }
          />
        ) : (
          <Stagger className="space-y-2.5">
            {purchases.map((purchase) => (
              <StaggerItem key={purchase.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <CardTitle className="text-sm">
                      {purchase.pathway?.title ?? "Parcours supprimé"}
                    </CardTitle>
                    <p className="mt-1 text-xs text-ivoire-faint">
                      {formatXof(purchase.amountXof)} · {formatDate(purchase.createdAt)}
                      {purchase.grantedBy && " · offert par l'équipe"}
                    </p>
                  </div>
                  {purchase.pathway && (
                    <Link href={`/parcours/${purchase.pathway.slug}`} className="shrink-0">
                      <Button variant="secondary" size="sm">
                        Ouvrir
                      </Button>
                    </Link>
                  )}
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Historique des paiements</h2>
        {payments.length === 0 ? (
          <Card>
            <p className="text-sm text-ivoire-dim">Aucun paiement enregistré.</p>
          </Card>
        ) : (
          <Card className="p-0">
            <ul>
              {payments.map((payment) => {
                const status = STATUS[payment.status] ?? STATUS.pending;
                return (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-3 border-b border-ivoire/6 px-4 py-3.5 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ivoire/6 text-ivoire-dim">
                        <Receipt size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-ivoire">
                          {payment.kind === "premium" ? "Abonnement Premium" : "Achat de parcours"}
                        </p>
                        <p className="text-xs text-ivoire-faint">
                          {formatDate(payment.createdAt)} · {payment.provider}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-sm text-ivoire">
                        {formatXof(payment.amountXof)}
                      </span>
                      <Badge tone={status.tone}>
                        <status.icon size={11} /> {status.label}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>
    </PageTransition>
  );
}
