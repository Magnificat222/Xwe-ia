import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { TicketStatusActions } from "@/components/admin/ticket-actions";
import { requireRole } from "@/lib/auth/guards";
import { getAdminTickets } from "@/lib/queries/admin";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Support" };

type Row = Awaited<ReturnType<typeof getAdminTickets>>[number];

const STATUS: Record<string, { label: string; tone: "or" | "feuillage" | "outline" }> = {
  open: { label: "Ouvert", tone: "or" },
  pending: { label: "Répondu", tone: "feuillage" },
  closed: { label: "Fermé", tone: "outline" },
};

export default async function AdminSupportPage() {
  await requireRole("moderator", "/admin/support");
  const tickets = await getAdminTickets();
  const open = tickets.filter((ticket) => ticket.status === "open").length;

  const columns: Column<Row>[] = [
    {
      key: "subject",
      header: "Demande",
      render: (row) => (
        <div className="min-w-0">
          <Link
            href={`/support/${row.id}`}
            className="inline-flex max-w-full items-center gap-1.5 truncate text-ivoire hover:text-or"
          >
            <span className="truncate">{row.subject}</span>
            <ExternalLink size={11} className="shrink-0" />
          </Link>
          <p className="truncate text-xs text-ivoire-faint">
            {row.userEmail ?? row.email ?? "Visiteur"} · {formatRelative(row.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: "updated",
      header: "Activité",
      secondary: true,
      render: (row) => <span className="text-xs">{formatRelative(row.updatedAt)}</span>,
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
      render: (row) => <TicketStatusActions id={row.id} status={row.status} />,
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        eyebrow="Communauté"
        title="Support"
        description={
          open > 0
            ? `${open} demande${open > 1 ? "s" : ""} en attente de réponse.`
            : "Aucune demande en attente."
        }
      />
      <DataTable
        columns={columns}
        rows={tickets}
        empty="Aucune demande de support."
        title={(row) => (
          <span className="flex items-center gap-2">
            <LifeBuoy size={14} className="text-or" /> {row.subject}
          </span>
        )}
      />
    </PageTransition>
  );
}
