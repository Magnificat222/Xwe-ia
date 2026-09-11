import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, ShoppingBag, Crown, Check, Clock, XCircle, Search, Ban } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, SectionHeading } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { CheckoutButton } from "@/components/app/checkout";
import { ResumeOrderButton, CancelOrderButton } from "@/components/app/order-actions";
import { requireUser } from "@/lib/auth/guards";
import { getUserPurchases, getActiveSubscription } from "@/lib/queries/commerce";
import { getUserOrders } from "@/lib/queries/commerce-admin";
import { getPathwayBySlug } from "@/lib/queries/catalogue";
import { quotePathway } from "@/lib/pricing";
import { formatXof, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mes achats" };

/** Chaque état de commande dit à l'utilisateur ce qu'il doit faire, ou attendre. */
const ORDER_STATUS: Record<
  string,
  { label: string; tone: "or" | "feuillage" | "braise" | "outline"; icon: typeof Check; hint: string }
> = {
  awaiting_payment: {
    label: "À payer",
    tone: "or",
    icon: Clock,
    hint: "Termine le paiement Mobile Money pour ouvrir ton accès.",
  },
  declared: {
    label: "En vérification",
    tone: "or",
    icon: Search,
    hint: "Nous vérifions ton paiement. Tu seras prévenu dès validation.",
  },
  under_review: {
    label: "Vérification approfondie",
    tone: "braise",
    icon: Search,
    hint: "Un point demande une vérification supplémentaire.",
  },
  confirmed: {
    label: "Confirmé",
    tone: "feuillage",
    icon: Check,
    hint: "Paiement validé, accès ouvert.",
  },
  rejected: {
    label: "Refusé",
    tone: "braise",
    icon: XCircle,
    hint: "Le paiement n'a pas pu être validé.",
  },
  canceled: { label: "Annulée", tone: "outline", icon: Ban, hint: "Commande annulée." },
  expired: { label: "Expirée", tone: "outline", icon: Clock, hint: "Le délai est dépassé." },
  draft: { label: "Brouillon", tone: "outline", icon: Clock, hint: "" },
};

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ parcours?: string }>;
}) {
  const session = await requireUser("/achats");
  const { parcours } = await searchParams;

  const [purchases, orders, subscription, target] = await Promise.all([
    getUserPurchases(session.id),
    getUserOrders(session.id),
    getActiveSubscription(session.id),
    parcours ? getPathwayBySlug(parcours) : Promise.resolve(null),
  ]);

  const alreadyOwned = target
    ? purchases.some((purchase) => purchase.pathwayId === target.id)
    : false;

  // Prix recalculé en base, promotions comprises.
  const quote = target && !alreadyOwned ? await quotePathway(target.id) : null;

  // Une commande déjà ouverte pour ce parcours ? On y renvoie plutôt que d'en créer une autre.
  const openOrder = target
    ? orders.find(
        (order) =>
          order.pathwaySlug === target.slug &&
          ["awaiting_payment", "declared", "under_review"].includes(order.status),
      )
    : undefined;

  const activeOrders = orders.filter((order) =>
    ["awaiting_payment", "declared", "under_review"].includes(order.status),
  );
  const pastOrders = orders.filter(
    (order) => !["awaiting_payment", "declared", "under_review"].includes(order.status),
  );

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-8">
      <SectionHeading
        eyebrow="Ton compte"
        title="Mes achats"
        description="Tes commandes, tes parcours, ton abonnement et l'historique de tes paiements."
      />

      {/* Achat lancé depuis une fiche parcours. */}
      {target && !alreadyOwned && target.accessType === "paid" && quote && (
        <Card tone="braise">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-braise-vif">
            Achat en cours
          </p>
          <CardTitle className="mt-2 text-base">{target.title}</CardTitle>
          <CardDescription>{target.expectedResult}</CardDescription>

          {quote.isDiscounted && quote.promotion && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-feuillage/12 px-2.5 py-1 text-xs text-feuillage-vif">
              {quote.promotion.label} · −{formatXof(quote.discountXof)}
            </p>
          )}

          <div className="mt-5">
            {openOrder ? (
              <ResumeOrderButton
                orderId={openOrder.id}
                reference={openOrder.reference}
                amountXof={openOrder.amountXof}
              />
            ) : (
              <CheckoutButton
                kind="pathway"
                targetSlug={target.slug}
                amountXof={quote.amountXof}
                listPriceXof={quote.listPriceXof}
                label="Acheter ce parcours"
              />
            )}
          </div>
        </Card>
      )}

      {/* Commandes en cours : c'est l'information la plus utile de la page. */}
      {activeOrders.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg text-ivoire">Commandes en cours</h2>
          <Stagger className="space-y-2.5">
            {activeOrders.map((order) => {
              const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.draft;
              return (
                <StaggerItem key={order.id}>
                  <Card tone={order.status === "awaiting_payment" ? "or" : "default"}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-sm">
                          {order.kind === "premium"
                            ? "Abonnement Premium"
                            : (order.pathwayTitle ?? "Parcours")}
                        </CardTitle>
                        <p className="mt-1 font-mono text-xs text-braise-vif">{order.reference}</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-ivoire-dim">
                          {status.hint}
                        </p>
                        {order.reviewNote && (
                          <p className="mt-1.5 text-xs text-ivoire-faint">
                            Note : {order.reviewNote}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Badge tone={status.tone}>
                          <status.icon size={11} /> {status.label}
                        </Badge>
                        <span className="font-mono text-sm text-ivoire">
                          {formatXof(order.amountXof)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {order.status === "awaiting_payment" && (
                        <>
                          <ResumeOrderButton
                            orderId={order.id}
                            reference={order.reference}
                            amountXof={order.amountXof}
                          />
                          <CancelOrderButton orderId={order.id} />
                        </>
                      )}
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>
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
        <h2 className="mb-4 font-display text-lg text-ivoire">Historique des commandes</h2>
        {pastOrders.length === 0 ? (
          <Card>
            <p className="text-sm text-ivoire-dim">Aucune commande terminée.</p>
          </Card>
        ) : (
          <Card className="p-0">
            <ul>
              {pastOrders.map((order) => {
                const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.draft;
                return (
                  <li
                    key={order.id}
                    className="flex items-center justify-between gap-3 border-b border-ivoire/6 px-4 py-3.5 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ivoire/6 text-ivoire-dim">
                        <Receipt size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ivoire">
                          {order.kind === "premium"
                            ? "Abonnement Premium"
                            : (order.pathwayTitle ?? "Parcours")}
                        </p>
                        <p className="font-mono text-xs text-ivoire-faint">
                          {order.reference} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-sm text-ivoire">
                        {formatXof(order.amountXof)}
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
