import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { Input, Textarea, Checkbox } from "@/components/ui/field";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { EntityEditor, EditTrigger } from "@/components/admin/entity-editor";
import { requireRole } from "@/lib/auth/guards";
import { getAdminLegalPages } from "@/lib/queries/admin";
import { saveLegalPageAction } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Pages légales" };

type Row = Awaited<ReturnType<typeof getAdminLegalPages>>[number];

export default async function AdminLegalPage() {
  await requireRole("admin", "/admin/legal");
  const pages = await getAdminLegalPages();

  const fields = (page?: Row) => (
    <>
      {page && <input type="hidden" name="id" value={page.id} />}
      <Input name="title" label="Titre" defaultValue={page?.title} required />
      <Input
        name="slug"
        label="Identifiant d'URL"
        defaultValue={page?.slug}
        hint="La page sera accessible sur /legal/identifiant."
      />
      <Textarea
        name="body"
        label="Contenu"
        rows={20}
        defaultValue={page?.body}
        hint="Markdown simple : # titre, ## sous-titre, - liste, **gras**."
        className="font-mono"
      />
      <Checkbox name="isPublished" label="Publiée" defaultChecked={page?.isPublished ?? true} />
    </>
  );

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Page",
      render: (row) => (
        <div className="min-w-0">
          <Link
            href={`/legal/${row.slug}`}
            className="inline-flex max-w-full items-center gap-1.5 truncate text-ivoire hover:text-or"
          >
            <span className="truncate">{row.title}</span>
            <ExternalLink size={11} className="shrink-0" />
          </Link>
          <p className="truncate font-mono text-xs text-ivoire-faint">/legal/{row.slug}</p>
        </div>
      ),
    },
    {
      key: "updated",
      header: "Mise à jour",
      secondary: true,
      render: (row) => <span className="text-xs">{formatDate(row.updatedAt)}</span>,
    },
    {
      key: "state",
      header: "État",
      render: (row) => (
        <Badge tone={row.isPublished ? "feuillage" : "outline"}>
          {row.isPublished ? "Publiée" : "Brouillon"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <EntityEditor
          action={saveLegalPageAction}
          title={`Modifier « ${row.title} »`}
          trigger={<EditTrigger />}
          wide
        >
          {fields(row)}
        </EntityEditor>
      ),
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-6">
      <SectionHeading
        eyebrow="Plateforme"
        title="Pages légales"
        description="Conditions d'utilisation, confidentialité, mentions légales."
        action={
          <EntityEditor action={saveLegalPageAction} title="Nouvelle page légale" wide>
            {fields()}
          </EntityEditor>
        }
      />
      <DataTable columns={columns} rows={pages} empty="Aucune page." title={(row) => row.title} />
    </PageTransition>
  );
}
