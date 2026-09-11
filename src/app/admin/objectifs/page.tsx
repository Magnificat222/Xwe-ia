import type { Metadata } from "next";
import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/field";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { EntityEditor, EditTrigger } from "@/components/admin/entity-editor";
import { ToggleButton } from "@/components/admin/toggle-button";
import { requireRole } from "@/lib/auth/guards";
import { getAdminGoals, getAdminCategories } from "@/lib/queries/admin";
import { saveGoalAction, toggleGoalAction } from "@/lib/actions/admin";
import { resolveIcon, ICON_NAMES } from "@/lib/icons";

export const metadata: Metadata = { title: "Objectifs" };

type Row = Awaited<ReturnType<typeof getAdminGoals>>[number];

export default async function AdminGoalsPage() {
  await requireRole("admin", "/admin/objectifs");
  const [goals, categories] = await Promise.all([getAdminGoals(), getAdminCategories()]);

  const fields = (goal?: Row) => (
    <>
      {goal && <input type="hidden" name="id" value={goal.id} />}
      <Input name="title" label="Titre" defaultValue={goal?.title} required />
      <Input
        name="slug"
        label="Identifiant d'URL"
        defaultValue={goal?.slug}
        hint="Laisse vide pour le générer depuis le titre."
      />
      <Input
        name="tagline"
        label="Accroche"
        defaultValue={goal?.tagline}
        hint="Une phrase courte affichée sur la carte."
      />
      <Textarea name="description" label="Description" rows={4} defaultValue={goal?.description} />
      <Select name="icon" label="Icône" defaultValue={goal?.icon ?? "Target"}>
        {ICON_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <Select name="categoryId" label="Catégorie" defaultValue={goal?.categoryId ?? ""}>
        <option value="">Aucune</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input type="number" name="position" label="Position" defaultValue={goal?.position ?? 0} />
      <Checkbox
        name="isFeatured"
        label="Mettre en avant sur l'accueil"
        defaultChecked={goal?.isFeatured}
      />
      <Checkbox name="isActive" label="Objectif actif" defaultChecked={goal?.isActive ?? true} />
    </>
  );

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Objectif",
      render: (row) => {
        const Icon = resolveIcon(row.icon, Target);
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-or/10 text-or">
              <Icon size={16} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-ivoire">{row.title}</p>
              <p className="truncate text-xs text-ivoire-faint">{row.tagline}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Catégorie",
      secondary: true,
      render: (row) => <span className="text-xs">{row.category?.name ?? "—"}</span>,
    },
    {
      key: "pathways",
      header: "Parcours",
      render: (row) => <span className="font-mono text-xs">{row.pathwayCount}</span>,
    },
    {
      key: "state",
      header: "État",
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-1.5 lg:justify-start">
          {row.isFeatured && <Badge tone="or">À la une</Badge>}
          <Badge tone={row.isActive ? "feuillage" : "outline"}>
            {row.isActive ? "Actif" : "Masqué"}
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
          <ToggleButton
            action={toggleGoalAction.bind(null, row.id)}
            active={row.isActive}
            label={row.isActive ? "Désactiver" : "Activer"}
          />
          <EntityEditor
            action={saveGoalAction}
            title={`Modifier « ${row.title} »`}
            trigger={<EditTrigger />}
          >
            {fields(row)}
          </EntityEditor>
        </div>
      ),
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        eyebrow="Contenu"
        title="Objectifs"
        description="Ce que les utilisateurs peuvent vouloir accomplir. C'est l'entrée du produit."
        action={
          <EntityEditor
            action={saveGoalAction}
            title="Nouvel objectif"
            description="Il apparaîtra dans la liste des objectifs une fois actif."
          >
            {fields()}
          </EntityEditor>
        }
      />

      <DataTable columns={columns} rows={goals} empty="Aucun objectif." title={(row) => row.title} />
    </PageTransition>
  );
}
