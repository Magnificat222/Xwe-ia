import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/field";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { EntityEditor, EditTrigger } from "@/components/admin/entity-editor";
import { DeleteButton } from "@/components/admin/toggle-button";
import { requireRole } from "@/lib/auth/guards";
import { getAdminTools, getAdminCategories } from "@/lib/queries/admin";
import { saveToolAction, deleteToolAction } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Outils" };

type Row = Awaited<ReturnType<typeof getAdminTools>>[number];

export default async function AdminToolsPage() {
  await requireRole("admin", "/admin/outils");
  const [tools, categories] = await Promise.all([getAdminTools(), getAdminCategories()]);

  const fields = (tool?: Row) => (
    <>
      {tool && <input type="hidden" name="id" value={tool.id} />}
      <Input name="name" label="Nom" defaultValue={tool?.name} required />
      <Input name="slug" label="Identifiant d'URL" defaultValue={tool?.slug} />
      <Textarea name="description" label="Description" rows={3} defaultValue={tool?.description} />
      <Input type="url" name="url" label="Lien" defaultValue={tool?.url} required />
      <Input
        name="pricing"
        label="Tarification"
        defaultValue={tool?.pricing}
        hint="Par exemple : Gratuit, ou À partir de 20 $/mois."
      />
      <Select name="categoryId" label="Catégorie" defaultValue={tool?.categoryId ?? ""}>
        <option value="">Aucune</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Textarea
        name="useCases"
        label="Cas d'usage"
        rows={4}
        defaultValue={tool?.useCases.join("\n")}
        hint="Un cas d'usage par ligne."
      />
      <Input type="number" name="position" label="Position" defaultValue={tool?.position ?? 0} />
      <Checkbox name="isFree" label="Dispose d'une offre gratuite" defaultChecked={tool?.isFree} />
      <Checkbox name="isPublished" label="Publié" defaultChecked={tool?.isPublished ?? true} />
    </>
  );

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Outil",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-ivoire">{row.name}</p>
          <p className="line-clamp-1 text-xs text-ivoire-faint">{row.description}</p>
        </div>
      ),
    },
    {
      key: "url",
      header: "Lien",
      secondary: true,
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1 text-xs text-or hover:underline"
        >
          Ouvrir <ExternalLink size={11} />
        </a>
      ),
    },
    {
      key: "pricing",
      header: "Tarif",
      render: (row) => <span className="text-xs">{row.pricing || "—"}</span>,
    },
    {
      key: "state",
      header: "État",
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-1.5 lg:justify-start">
          {row.isFree && <Badge tone="feuillage">Gratuit</Badge>}
          <Badge tone={row.isPublished ? "or" : "outline"}>
            {row.isPublished ? "Publié" : "Masqué"}
          </Badge>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <EntityEditor
            action={saveToolAction}
            title={`Modifier « ${row.name} »`}
            trigger={<EditTrigger />}
          >
            {fields(row)}
          </EntityEditor>
          <DeleteButton
            action={deleteToolAction.bind(null, row.id)}
            label="Supprimer l'outil"
            confirm={`Supprimer « ${row.name} » ?`}
          />
        </div>
      ),
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        eyebrow="Contenu"
        title="Outils IA"
        description="La sélection présentée aux membres. Chaque outil doit servir dans une mission."
        action={
          <EntityEditor action={saveToolAction} title="Nouvel outil">
            {fields()}
          </EntityEditor>
        }
      />
      <DataTable columns={columns} rows={tools} empty="Aucun outil." title={(row) => row.name} />
    </PageTransition>
  );
}
