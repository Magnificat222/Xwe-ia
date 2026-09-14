import type { Metadata } from "next";
import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ReportActions } from "@/components/admin/report-actions";
import { requireRole } from "@/lib/auth/guards";
import { getAdminReports } from "@/lib/queries/admin";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Signalements" };

type Row = Awaited<ReturnType<typeof getAdminReports>>[number];

const STATUS: Record<string, { label: string; tone: "or" | "feuillage" | "outline" | "braise" }> = {
  open: { label: "Ouvert", tone: "braise" },
  reviewing: { label: "En cours", tone: "or" },
  resolved: { label: "Traité", tone: "feuillage" },
  dismissed: { label: "Rejeté", tone: "outline" },
};

export default async function AdminReportsPage() {
  await requireRole("moderator", "/admin/signalements");
  const reports = await getAdminReports();

  const columns: Column<Row>[] = [
    {
      key: "reason",
      header: "Motif",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-ivoire">{row.reason}</p>
          <p className="truncate text-xs text-ivoire-faint">
            {row.entityType} · signalé par {row.reporterName ?? "anonyme"}
          </p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      secondary: true,
      render: (row) => <span className="text-xs">{formatRelative(row.createdAt)}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => {
        const status = STATUS[row.status] ?? STATUS.open;
        return <Badge tone={status.tone}>{status.label}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => <ReportActions id={row.id} status={row.status} />,
    },
  ];

  const open = reports.filter((report) => report.status === "open").length;

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        eyebrow="Modération"
        title="Signalements"
        description={
          open > 0
            ? `${open} signalement${open > 1 ? "s" : ""} en attente de traitement.`
            : "Aucun signalement en attente."
        }
      />
      <DataTable
        columns={columns}
        rows={reports}
        empty="Aucun signalement."
        title={(row) => (
          <span className="flex items-center gap-2">
            <Flag size={14} className="text-braise-vif" /> {row.reason}
          </span>
        )}
      />
    </PageTransition>
  );
}
