import type { Metadata } from "next";
import { Crown, Gift, Sparkles } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat, SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { requireRole } from "@/lib/auth/guards";
import { EntityEditor, EditTrigger } from "@/components/admin/entity-editor";
import { DeleteButton } from "@/components/admin/toggle-button";
import { BenefitFields } from "@/components/admin/benefit-fields";
import { resolveIcon } from "@/lib/icons";
import { getAdminSubscriptions } from "@/lib/queries/admin";
import { getPremiumBenefits } from "@/lib/queries/commerce-admin";
import {
  savePremiumBenefitAction,
  deletePremiumBenefitAction,
} from "@/lib/actions/admin-commerce";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Abonnements" };

type Row = Awaited<ReturnType<typeof getAdminSubscriptions>>[number];

const STATUS: Record<string, { label: string; tone: "or" | "feuillage" | "outline" | "braise" }> = {
  active: { label: "Actif", tone: "feuillage" },
  canceled: { label: "Annulé", tone: "outline" },
  expired: { label: "Expiré", tone: "braise" },
  trialing: { label: "Essai", tone: "or" },
};

export default async function AdminSubscriptionsPage() {
  await requireRole("admin", "/admin/premium");
  const [subscriptions, benefits] = await Promise.all([
    getAdminSubscriptions(),
    getPremiumBenefits(),
  ]);

  const active = subscriptions.filter(
    (subscription) => subscription.status === "active" && subscription.plan === "premium",
  );
  const granted = subscriptions.filter((subscription) => subscription.grantedBy);

  const columns: Column<Row>[] = [
    {
      key: "user",
      header: "Membre",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-ivoire">{row.name ?? "—"}</p>
          <p className="truncate text-xs text-ivoire-faint">{row.email}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Formule",
      render: (row) =>
        row.plan === "premium" ? (
          <Badge tone="or">
            <Crown size={11} /> Premium
          </Badge>
        ) : (
          <Badge tone="outline">Gratuit</Badge>
        ),
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => {
        const status = STATUS[row.status] ?? STATUS.active;
        return <Badge tone={status.tone}>{status.label}</Badge>;
      },
    },
    {
      key: "end",
      header: "Échéance",
      secondary: true,
      render: (row) => (
        <span className="text-xs">
          {row.currentPeriodEnd ? formatDate(row.currentPeriodEnd) : "—"}
        </span>
      ),
    },
    {
      key: "granted",
      header: "Origine",
      render: (row) =>
        row.grantedBy ? (
          <Badge tone="braise">
            <Gift size={11} /> Offert
          </Badge>
        ) : (
          <span className="text-xs text-ivoire-faint">Paiement</span>
        ),
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        eyebrow="Monétisation"
        title="Abonnements"
        description="Pour accorder ou retirer Premium à un membre, passe par la fiche utilisateur."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Abonnés actifs" value={active.length} icon={<Crown size={18} />} tone="or" />
        <Stat label="Accès offerts" value={granted.length} icon={<Gift size={18} />} tone="braise" />
        <Stat
          label="Total enregistrés"
          value={subscriptions.length}
          icon={<Crown size={18} />}
          tone="feuillage"
        />
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg text-ivoire">
              <Sparkles size={18} className="text-or" /> Avantages annoncés
            </h2>
            <p className="mt-1 text-sm text-ivoire-dim">
              Ce que promet la page Premium. N'annonce que ce que le produit tient réellement.
            </p>
          </div>
          <EntityEditor
            action={savePremiumBenefitAction}
            title="Nouvel avantage"
            description="Une promesse concrète, formulée du point de vue du membre."
          >
            <BenefitFields />
          </EntityEditor>
        </div>

        {benefits.length === 0 ? (
          <Card>
            <p className="text-sm text-ivoire-dim">
              Aucun avantage listé : la page Premium paraîtra vide.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = resolveIcon(benefit.icon);
              return (
                <Card key={benefit.id} tone={benefit.isActive ? "default" : undefined}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-or/12 text-or">
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0">
                        <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
                          {benefit.label}
                          {!benefit.isActive && <Badge tone="outline">Masqué</Badge>}
                        </CardTitle>
                        {benefit.description && (
                          <p className="mt-1 text-xs leading-relaxed text-ivoire-dim">
                            {benefit.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <EntityEditor
                        action={savePremiumBenefitAction}
                        title="Modifier l'avantage"
                        trigger={<EditTrigger />}
                      >
                        <BenefitFields benefit={benefit} />
                      </EntityEditor>
                      <DeleteButton
                        action={deletePremiumBenefitAction.bind(null, benefit.id)}
                        label="Supprimer l'avantage"
                        confirm={`Supprimer « ${benefit.label} » ?`}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Membres abonnés</h2>
        <DataTable
          columns={columns}
          rows={subscriptions}
          empty="Aucun abonnement."
          title={(row) => row.email ?? "—"}
        />
      </section>
    </PageTransition>
  );
}
