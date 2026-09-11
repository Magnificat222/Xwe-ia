import type { Metadata } from "next";
import { ExternalLink, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { requireRole } from "@/lib/auth/guards";
import { getAdminResources } from "@/lib/queries/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Ressources" };

type Row = Awaited<ReturnType<typeof getAdminResources>>[number];

export default async function AdminResourcesPage() {
  await requireRole("admin", "/admin/ressources");
  const resources = await getAdminResources();

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Ressource",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-ivoire">{row.title}</p>
          <p className="line-clamp-1 text-xs text-ivoire-faint">{row.description}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => <Badge tone="outline">{row.type}</Badge>,
    },
    {
      key: "access",
      header: "Accès",
      render: (row) => (
        <Badge tone={row.accessType === "free" ? "feuillage" : "or"}>{row.accessType}</Badge>
      ),
    },
    {
      key: "url",
      header: "Lien",
      secondary: true,
      render: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 text-xs text-or hover:underline"
          >
            Ouvrir <ExternalLink size={11} />
          </a>
        ) : (
          <span className="text-xs text-ivoire-faint">—</span>
        ),
    },
    {
      key: "created",
      header: "Ajoutée",
      secondary: true,
      render: (row) => <span className="text-xs">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        eyebrow="Contenu"
        title="Ressources"
        description="Articles, guides et modèles proposés en complément des missions."
      />
      <DataTable
        columns={columns}
        rows={resources}
        empty="Aucune ressource."
        title={(row) => (
          <span className="flex items-center gap-2">
            <BookOpen size={14} className="text-feuillage-vif" /> {row.title}
          </span>
        )}
      />
    </PageTransition>
  );
}
