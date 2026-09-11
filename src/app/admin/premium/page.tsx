import type { Metadata } from "next";
import { Crown, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Stat, SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { requireRole } from "@/lib/auth/guards";
import { getAdminSubscriptions } from "@/lib/queries/admin";
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
  const subscriptions = await getAdminSubscriptions();

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

      <DataTable
        columns={columns}
        rows={subscriptions}
        empty="Aucun abonnement."
        title={(row) => row.email ?? "—"}
      />
    </PageTransition>
  );
}
