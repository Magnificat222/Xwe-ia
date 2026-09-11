import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, AlertTriangle, Check, Clock, Search, XCircle, Ban } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, EmptyState } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { OrderActions } from "@/components/admin/order-actions";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOrders, getOrderCounts } from "@/lib/queries/commerce-admin";
import type { OrderStatus } from "@/db/schema";
import { formatXof, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Commandes" };

const STATUS_META: Record<
  string,
  { label: string; tone: "or" | "feuillage" | "braise" | "outline"; icon: typeof Check }
> = {
  awaiting_payment: { label: "À payer", tone: "outline", icon: Clock },
  declared: { label: "À vérifier", tone: "or", icon: Search },
  under_review: { label: "En vérification", tone: "braise", icon: Search },
  confirmed: { label: "Confirmée", tone: "feuillage", icon: Check },
  rejected: { label: "Refusée", tone: "braise", icon: XCircle },
  canceled: { label: "Annulée", tone: "outline", icon: Ban },
  expired: { label: "Expirée", tone: "outline", icon: Clock },
  draft: { label: "Brouillon", tone: "outline", icon: Clock },
};

const FILTERS: { value: string; label: string }[] = [
  { value: "declared", label: "À vérifier" },
  { value: "under_review", label: "En vérification" },
  { value: "awaiting_payment", label: "En attente de paiement" },
  { value: "confirmed", label: "Confirmées" },
  { value: "rejected", label: "Refusées" },
  { value: "", label: "Toutes" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; q?: string }>;
}) {
  await requireRole("admin", "/admin/commandes");
  const { statut, q } = await searchParams;

  // Par défaut on montre ce qui attend une décision : c'est le travail du jour.
  const status = (statut ?? "declared") as OrderStatus | "";

  const [orders, counts] = await Promise.all([
    getAdminOrders({ status: status || undefined, q }),
    getOrderCounts(),
  ]);

  const toProcess = counts.declared + counts.underReview;

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        eyebrow="Monétisation"
        title="Commandes"
        description="Vérifie les paiements Mobile Money déclarés, puis ouvre ou refuse l'accès."
      />

      {toProcess > 0 && (
        <Card tone="or">
          <p className="flex items-center gap-2 text-sm text-ivoire">
            <AlertTriangle size={16} className="shrink-0 text-or" />
            {toProcess} commande{toProcess > 1 ? "s" : ""} attend
            {toProcess > 1 ? "ent" : ""} une décision.
          </p>
        </Card>
      )}

      <nav aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = (statut ?? "declared") === filter.value;
          const badge =
            filter.value === "declared"
              ? counts.declared
              : filter.value === "under_review"
                ? counts.underReview
                : filter.value === "awaiting_payment"
                  ? counts.awaiting
                  : filter.value === "confirmed"
                    ? counts.confirmed
                    : filter.value === "rejected"
                      ? counts.rejected
                      : counts.total;

          return (
            <Link
              key={filter.value || "all"}
              href={filter.value ? `/admin/commandes?statut=${filter.value}` : "/admin/commandes?statut="}
              className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                active
                  ? "border-or bg-or/12 text-or-vif"
                  : "border-ivoire/12 text-ivoire-dim hover:border-or/30 hover:text-ivoire"
              }`}
            >
              {filter.label}
              <span className="ml-1.5 font-mono text-xs opacity-70">{badge}</span>
            </Link>
          );
        })}
      </nav>

      <form method="get" className="flex gap-2">
        <input type="hidden" name="statut" value={statut ?? ""} />
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Référence, e-mail ou identifiant de transaction"
          aria-label="Rechercher une commande"
          className="min-h-11 flex-1 rounded-card border border-ivoire/12 bg-noir-elevated px-3.5 text-sm text-ivoire placeholder:text-ivoire-faint focus:border-or/50 focus:outline-none focus:ring-2 focus:ring-or/25"
        />
      </form>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Receipt size={22} />}
          title="Aucune commande"
          description="Rien à traiter dans cette catégorie."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const meta = STATUS_META[order.status] ?? STATUS_META.draft;
            const needsDecision =
              order.status === "declared" || order.status === "under_review";
            // Un écart de montant est le signal le plus utile pour l'équipe.
            const mismatch =
              order.declaredAmountXof !== null &&
              order.declaredAmountXof !== undefined &&
              order.declaredAmountXof !== order.amountXof;

            return (
              <Card key={order.id} tone={needsDecision ? "or" : "default"}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm text-braise-vif">{order.reference}</span>
                      <Badge tone={meta.tone}>
                        <meta.icon size={11} /> {meta.label}
                      </Badge>
                      {mismatch && (
                        <Badge tone="braise">
                          <AlertTriangle size={11} /> Écart de montant
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="mt-2 text-sm">
                      {order.kind === "premium"
                        ? "Abonnement Premium"
                        : (order.pathwayTitle ?? "Parcours supprimé")}
                    </CardTitle>

                    <p className="mt-1 text-xs text-ivoire-dim">
                      {order.userName ?? "—"} · {order.userEmail}
                    </p>

                    <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
                      <div className="flex justify-between gap-3 sm:justify-start">
                        <dt className="text-ivoire-faint">Montant dû</dt>
                        <dd className="font-mono text-ivoire">{formatXof(order.amountXof)}</dd>
                      </div>
                      {order.declaredAmountXof !== null && (
                        <div className="flex justify-between gap-3 sm:justify-start">
                          <dt className="text-ivoire-faint">Déclaré</dt>
                          <dd
                            className={`font-mono ${mismatch ? "text-braise-vif" : "text-ivoire"}`}
                          >
                            {formatXof(order.declaredAmountXof)}
                          </dd>
                        </div>
                      )}
                      {order.payerNumber && (
                        <div className="flex justify-between gap-3 sm:justify-start">
                          <dt className="text-ivoire-faint">Payeur</dt>
                          <dd className="font-mono text-ivoire">{order.payerNumber}</dd>
                        </div>
                      )}
                      {order.declaredReference && (
                        <div className="flex justify-between gap-3 sm:justify-start">
                          <dt className="text-ivoire-faint">Transaction</dt>
                          <dd className="truncate font-mono text-ivoire">
                            {order.declaredReference}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {order.reviewNote && (
                      <p className="mt-2.5 rounded-lg bg-ivoire/[0.04] px-3 py-2 text-xs text-ivoire-dim">
                        Note : {order.reviewNote}
                      </p>
                    )}

                    <p className="mt-2.5 text-[0.7rem] text-ivoire-faint">
                      Créée {formatRelative(order.createdAt)}
                      {order.declaredAt && ` · déclarée ${formatRelative(order.declaredAt)}`}
                    </p>
                  </div>
                </div>

                {needsDecision && (
                  <div className="mt-4 border-t border-ivoire/8 pt-4">
                    <OrderActions
                      orderId={order.id}
                      reference={order.reference}
                      amountLabel={formatXof(order.amountXof)}
                      declaredAmountLabel={
                        order.declaredAmountXof !== null
                          ? formatXof(order.declaredAmountXof)
                          : undefined
                      }
                      mismatch={mismatch}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
