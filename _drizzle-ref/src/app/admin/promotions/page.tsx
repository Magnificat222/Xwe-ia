import type { Metadata } from "next";
import { TicketPercent, Calendar } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, EmptyState } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { EntityEditor, EditTrigger } from "@/components/admin/entity-editor";
import { ToggleButton, DeleteButton } from "@/components/admin/toggle-button";
import { PromotionFields } from "@/components/admin/promotion-fields";
import { requireRole } from "@/lib/auth/guards";
import { getAdminPromotions } from "@/lib/queries/commerce-admin";
import { getAdminPathways } from "@/lib/queries/admin";
import {
  savePromotionAction,
  togglePromotionAction,
  deletePromotionAction,
} from "@/lib/actions/admin-commerce";
import { formatXof, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Promotions" };

function describeDiscount(type: string, value: number) {
  if (type === "percent") return `−${value} %`;
  if (type === "amount") return `−${formatXof(value)}`;
  return `Prix fixe ${formatXof(value)}`;
}

export default async function AdminPromotionsPage() {
  await requireRole("admin", "/admin/promotions");

  const [promos, pathways] = await Promise.all([getAdminPromotions(), getAdminPathways()]);
  const paidPathways = pathways
    .filter((p) => p.accessType === "paid")
    .map((p) => ({ id: p.id, title: p.title }));

  const now = new Date();

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-6">
      <SectionHeading
        eyebrow="Monétisation"
        title="Promotions"
        description="Réductions sur un parcours, sur le Premium, ou sur tout le catalogue."
        action={
          <EntityEditor
            action={savePromotionAction}
            title="Nouvelle promotion"
            description="Laisse le parcours vide pour appliquer la remise à tout le catalogue payant."
            wide
          >
            <PromotionFields pathways={paidPathways} />
          </EntityEditor>
        }
      />

      {promos.length === 0 ? (
        <EmptyState
          icon={<TicketPercent size={22} />}
          title="Aucune promotion"
          description="Crée une remise pour animer une période de lancement ou un événement."
        />
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => {
            const started = !promo.startsAt || promo.startsAt <= now;
            const ended = promo.endsAt ? promo.endsAt < now : false;
            const exhausted =
              promo.maxRedemptions !== null && promo.redemptions >= promo.maxRedemptions;
            const live = promo.isActive && started && !ended && !exhausted;

            return (
              <Card key={promo.id} tone={live ? "or" : "default"}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-sm">{promo.label}</CardTitle>
                      <Badge tone={live ? "feuillage" : "outline"}>
                        {live
                          ? "En cours"
                          : !promo.isActive
                            ? "Désactivée"
                            : ended
                              ? "Terminée"
                              : exhausted
                                ? "Épuisée"
                                : "Programmée"}
                      </Badge>
                      <Badge tone="braise">
                        {describeDiscount(promo.discountType, promo.discountValue)}
                      </Badge>
                    </div>

                    <p className="mt-1.5 text-xs text-ivoire-dim">
                      {promo.appliesToPremium
                        ? "Abonnement Premium"
                        : (promo.pathwayTitle ?? "Tout le catalogue payant")}
                      {promo.code && (
                        <>
                          {" · code "}
                          <span className="font-mono text-or">{promo.code}</span>
                        </>
                      )}
                    </p>

                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-ivoire-faint">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {promo.startsAt ? formatDate(promo.startsAt) : "immédiat"} →{" "}
                        {promo.endsAt ? formatDate(promo.endsAt) : "sans fin"}
                      </span>
                      <span>
                        {promo.redemptions} utilisation{promo.redemptions > 1 ? "s" : ""}
                        {promo.maxRedemptions !== null && ` / ${promo.maxRedemptions}`}
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <EntityEditor
                      action={savePromotionAction}
                      title="Modifier la promotion"
                      wide
                      trigger={<EditTrigger />}
                    >
                      <PromotionFields pathways={paidPathways} promotion={promo} />
                    </EntityEditor>
                    <ToggleButton
                      action={togglePromotionAction.bind(null, promo.id, !promo.isActive)}
                      active={promo.isActive}
                      label={promo.isActive ? "Désactiver" : "Activer"}
                    />
                    <DeleteButton
                      action={deletePromotionAction.bind(null, promo.id)}
                      label="Supprimer"
                      confirm={`Supprimer la promotion « ${promo.label} » ?`}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
