import type { Metadata } from "next";
import { CreditCard, Check, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Stat, SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmPaymentButton } from "@/components/admin/payment-actions";
import { requireRole } from "@/lib/auth/guards";
import { getAdminPayments } from "@/lib/queries/admin";
import { formatXof, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Paiements" };

type Row = Awaited<ReturnType<typeof getAdminPayments>>[number];

const STATUS: Record<
  string,
  { label: string; tone: "or" | "feuillage" | "braise" | "outline"; icon: typeof Check }
> = {
  completed: { label: "Payé", tone: "feuillage", icon: Check },
  pending: { label: "En attente", tone: "or", icon: Clock },
  failed: { label: "Échoué", tone: "braise", icon: XCircle },
  refunded: { label: "Remboursé", tone: "outline", icon: XCircle },
};

export default async function AdminPaymentsPage() {
  await requireRole("admin", "/admin/paiements");
  const payments = await getAdminPayments();

  const collected = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amountXof, 0);
  const pendingCount = payments.filter((payment) => payment.status === "pending").length;

  const columns: Column<Row>[] = [
    {
      key: "user",
      header: "Client",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-ivoire">{row.email ?? "Compte supprimé"}</p>
          <p className="truncate text-xs text-ivoire-faint">
            {row.kind === "premium" ? "Abonnement Premium" : "Parcours"} ·{" "}
            {formatDate(row.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Montant",
      render: (row) => <span className="font-mono text-sm text-ivoire">{formatXof(row.amountXof)}</span>,
    },
    {
      key: "provider",
      header: "Fournisseur",
      secondary: true,
      render: (row) => (
        <span className="text-xs">
          {row.provider}
          {row.transactionId && (
            <span className="block font-mono text-[0.65rem] text-ivoire-faint">
              {row.transactionId}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => {
        const status = STATUS[row.status] ?? STATUS.pending;
        return (
          <Badge tone={status.tone}>
            <status.icon size={11} /> {status.label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) =>
        row.status === "pending" ? <ConfirmPaymentButton id={row.id} /> : null,
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        eyebrow="Monétisation"
        title="Paiements"
        description="Valider un paiement ouvre immédiatement l'accès correspondant."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Encaissé" value={formatXof(collected)} icon={<CreditCard size={18} />} tone="feuillage" />
        <Stat label="En attente" value={pendingCount} icon={<Clock size={18} />} tone="or" />
        <Stat label="Transactions" value={payments.length} icon={<CreditCard size={18} />} tone="braise" />
      </div>

      <DataTable
        columns={columns}
        rows={payments}
        empty="Aucun paiement enregistré."
        title={(row) => row.email ?? "Compte supprimé"}
      />
    </PageTransition>
  );
}
