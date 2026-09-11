import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ToggleButton, DeleteButton } from "@/components/admin/toggle-button";
import { requireRole } from "@/lib/auth/guards";
import { getAdminDiscussions } from "@/lib/queries/admin";
import {
  pinDiscussionAction,
  lockDiscussionAction,
  hideDiscussionAction,
  deleteDiscussionAction,
} from "@/lib/actions/moderation";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Discussion" };

type Row = Awaited<ReturnType<typeof getAdminDiscussions>>[number];

export default async function AdminDiscussionPage() {
  await requireRole("moderator", "/admin/discussion");
  const topics = await getAdminDiscussions();

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Sujet",
      render: (row) => (
        <div className="min-w-0">
          <Link
            href={`/discussion/${row.id}`}
            className="inline-flex max-w-full items-center gap-1.5 truncate text-ivoire hover:text-or"
          >
            <span className="truncate">{row.title}</span>
            <ExternalLink size={11} className="shrink-0" />
          </Link>
          <p className="truncate text-xs text-ivoire-faint">
            {row.authorName ?? "Membre supprimé"} · {formatRelative(row.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: "replies",
      header: "Réponses",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs">
          <MessageSquare size={12} /> {row.replyCount}
        </span>
      ),
    },
    {
      key: "activity",
      header: "Activité",
      secondary: true,
      render: (row) => <span className="text-xs">{formatRelative(row.lastActivityAt)}</span>,
    },
    {
      key: "state",
      header: "État",
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-1.5 lg:justify-start">
          {row.isPinned && <Badge tone="or">Épinglé</Badge>}
          {row.isLocked && <Badge tone="braise">Fermé</Badge>}
          {row.isHidden && <Badge tone="erreur">Masqué</Badge>}
          {!row.isPinned && !row.isLocked && !row.isHidden && (
            <Badge tone="outline">Normal</Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <ToggleButton
            action={pinDiscussionAction.bind(null, row.id, !row.isPinned)}
            active={row.isPinned}
            variant="pin"
            label={row.isPinned ? "Désépingler" : "Épingler"}
          />
          <ToggleButton
            action={lockDiscussionAction.bind(null, row.id, !row.isLocked)}
            active={row.isLocked}
            variant="lock"
            tone="braise"
            label={row.isLocked ? "Rouvrir" : "Fermer"}
          />
          <ToggleButton
            action={hideDiscussionAction.bind(null, row.id, !row.isHidden, undefined)}
            active={!row.isHidden}
            variant="publish"
            label={row.isHidden ? "Rétablir le sujet" : "Masquer le sujet"}
          />
          <DeleteButton
            action={deleteDiscussionAction.bind(null, row.id, undefined)}
            label="Supprimer le sujet"
            confirm={`Supprimer définitivement « ${row.title} » et toutes ses réponses ?\n\nPréfère « masquer » si tu peux : la suppression est irréversible.`}
          />
        </div>
      ),
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        eyebrow="Modération"
        title="Discussion"
        description="Épingle ce qui est utile, ferme ce qui dérape, masque plutôt que de supprimer."
      />
      <DataTable columns={columns} rows={topics} empty="Aucun sujet." title={(row) => row.title} />
    </PageTransition>
  );
}
