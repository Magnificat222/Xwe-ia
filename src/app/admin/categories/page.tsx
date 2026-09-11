import type { Metadata } from "next";
import { Folder } from "lucide-react";
import { SectionHeading } from "@/components/ui/misc";
import { Input, Textarea, Select } from "@/components/ui/field";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { EntityEditor, EditTrigger } from "@/components/admin/entity-editor";
import { DeleteButton } from "@/components/admin/toggle-button";
import { requireRole } from "@/lib/auth/guards";
import { getAdminCategories } from "@/lib/queries/admin";
import { saveCategoryAction, deleteCategoryAction } from "@/lib/actions/admin";
import { resolveIcon, ICON_NAMES } from "@/lib/icons";

export const metadata: Metadata = { title: "Catégories" };

type Row = Awaited<ReturnType<typeof getAdminCategories>>[number];

export default async function AdminCategoriesPage() {
  await requireRole("admin", "/admin/categories");
  const categories = await getAdminCategories();

  const fields = (category?: Row) => (
    <>
      {category && <input type="hidden" name="id" value={category.id} />}
      <Input name="name" label="Nom" defaultValue={category?.name} required />
      <Input name="slug" label="Identifiant d'URL" defaultValue={category?.slug} />
      <Textarea name="description" label="Description" rows={3} defaultValue={category?.description} />
      <Select name="icon" label="Icône" defaultValue={category?.icon ?? "Sparkles"}>
        {ICON_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <Input type="number" name="position" label="Position" defaultValue={category?.position ?? 0} />
    </>
  );

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Catégorie",
      render: (row) => {
        const Icon = resolveIcon(row.icon, Folder);
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-or/10 text-or">
              <Icon size={16} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-ivoire">{row.name}</p>
              <p className="truncate text-xs text-ivoire-faint">{row.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "description",
      header: "Description",
      secondary: true,
      render: (row) => <span className="line-clamp-1 text-xs">{row.description || "—"}</span>,
    },
    {
      key: "position",
      header: "Position",
      render: (row) => <span className="font-mono text-xs">{row.position}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <EntityEditor
            action={saveCategoryAction}
            title={`Modifier « ${row.name} »`}
            trigger={<EditTrigger />}
          >
            {fields(row)}
          </EntityEditor>
          <DeleteButton
            action={deleteCategoryAction.bind(null, row.id)}
            label="Supprimer la catégorie"
            confirm={`Supprimer la catégorie « ${row.name} » ? Les contenus liés ne seront pas supprimés.`}
          />
        </div>
      ),
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-6">
      <SectionHeading
        eyebrow="Contenu"
        title="Catégories"
        description="Elles organisent les objectifs, parcours, outils et discussions."
        action={
          <EntityEditor action={saveCategoryAction} title="Nouvelle catégorie">
            {fields()}
          </EntityEditor>
        }
      />
      <DataTable columns={columns} rows={categories} empty="Aucune catégorie." title={(row) => row.name} />
    </PageTransition>
  );
}
