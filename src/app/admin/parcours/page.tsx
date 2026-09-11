import type { Metadata } from "next";
import Link from "next/link";
import { Users, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/field";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { EntityEditor, EditTrigger } from "@/components/admin/entity-editor";
import { ToggleButton } from "@/components/admin/toggle-button";
import { requireRole } from "@/lib/auth/guards";
import { getAdminPathways, getAdminCategories } from "@/lib/queries/admin";
import { savePathwayAction, togglePathwayAction } from "@/lib/actions/admin";
import { formatXof, formatMinutes, LEVEL_LABELS } from "@/lib/utils";

export const metadata: Metadata = { title: "Parcours" };

type Row = Awaited<ReturnType<typeof getAdminPathways>>[number];

export default async function AdminPathwaysPage() {
  await requireRole("admin", "/admin/parcours");
  const [pathways, categories] = await Promise.all([getAdminPathways(), getAdminCategories()]);

  const fields = (pathway?: Row) => (
    <>
      {pathway && <input type="hidden" name="id" value={pathway.id} />}
      <Input name="title" label="Titre" defaultValue={pathway?.title} required />
      <Input name="slug" label="Identifiant d'URL" defaultValue={pathway?.slug} />
      <Input
        name="summary"
        label="Résumé"
        defaultValue={pathway?.summary}
        hint="Une ou deux phrases affichées sur la carte."
      />
      <Textarea
        name="description"
        label="Description complète"
        rows={5}
        defaultValue={pathway?.description}
      />
      <Textarea
        name="expectedResult"
        label="Résultat attendu"
        rows={2}
        defaultValue={pathway?.expectedResult}
        hint="La promesse du parcours : ce que l'utilisateur obtient à la fin."
      />
      <Select name="categoryId" label="Catégorie" defaultValue={pathway?.categoryId ?? ""}>
        <option value="">Aucune</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Select name="level" label="Niveau" defaultValue={pathway?.level ?? "debutant"}>
        <option value="debutant">Débutant</option>
        <option value="intermediaire">Intermédiaire</option>
        <option value="avance">Avancé</option>
      </Select>
      <Select name="accessType" label="Type d'accès" defaultValue={pathway?.accessType ?? "free"}>
        <option value="free">Gratuit</option>
        <option value="paid">Payant (achat unique)</option>
        <option value="premium">Premium</option>
      </Select>
      <Input
        type="number"
        name="priceXof"
        label="Prix en FCFA"
        defaultValue={pathway?.priceXof ?? 0}
        hint="Utilisé uniquement pour le type « Payant »."
      />
      <Input
        type="number"
        name="durationMinutes"
        label="Durée estimée (minutes)"
        defaultValue={pathway?.durationMinutes ?? 60}
      />
      <Input name="imageUrl" label="Image de couverture (URL)" defaultValue={pathway?.imageUrl ?? ""} />
      <Input type="number" name="position" label="Position" defaultValue={pathway?.position ?? 0} />
      <Checkbox name="isPublished" label="Publié" defaultChecked={pathway?.isPublished} />
    </>
  );

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Parcours",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-ivoire">{row.title}</p>
          <p className="truncate text-xs text-ivoire-faint">
            {row.category?.name ?? "Sans catégorie"} · {LEVEL_LABELS[row.level]} ·{" "}
            {formatMinutes(row.durationMinutes)}
          </p>
        </div>
      ),
    },
    {
      key: "access",
      header: "Accès",
      render: (row) =>
        row.accessType === "free" ? (
          <Badge tone="feuillage">Gratuit</Badge>
        ) : row.accessType === "premium" ? (
          <Badge tone="or">Premium</Badge>
        ) : (
          <Badge tone="braise">{formatXof(row.priceXof)}</Badge>
        ),
    },
    {
      key: "missions",
      header: "Missions",
      render: (row) => (
        <Link
          href={`/admin/missions?parcours=${row.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-or hover:underline"
        >
          <ListChecks size={12} /> {row.missionCount}
        </Link>
      ),
    },
    {
      key: "learners",
      header: "Inscrits",
      secondary: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs">
          <Users size={12} /> {row.learners}
        </span>
      ),
    },
    {
      key: "state",
      header: "État",
      render: (row) => (
        <Badge tone={row.isPublished ? "feuillage" : "outline"}>
          {row.isPublished ? "Publié" : "Brouillon"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <ToggleButton
            action={togglePathwayAction.bind(null, row.id)}
            active={row.isPublished}
            label={row.isPublished ? "Dépublier" : "Publier"}
          />
          <EntityEditor
            action={savePathwayAction}
            title={`Modifier « ${row.title} »`}
            trigger={<EditTrigger />}
            wide
          >
            {fields(row)}
          </EntityEditor>
        </div>
      ),
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-6xl space-y-6">
      <SectionHeading
        eyebrow="Contenu"
        title="Parcours"
        description="Chaque parcours mène à un livrable précis. Le prix et l'accès se règlent ici."
        action={
          <EntityEditor action={savePathwayAction} title="Nouveau parcours" wide>
            {fields()}
          </EntityEditor>
        }
      />

      <DataTable
        columns={columns}
        rows={pathways}
        empty="Aucun parcours."
        title={(row) => row.title}
      />
    </PageTransition>
  );
}
