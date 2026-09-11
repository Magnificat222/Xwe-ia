import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/field";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { EntityEditor, EditTrigger } from "@/components/admin/entity-editor";
import { requireRole } from "@/lib/auth/guards";
import { getAdminMissions, getAdminPathways } from "@/lib/queries/admin";
import { saveMissionAction } from "@/lib/actions/admin";
import { formatMinutes } from "@/lib/utils";

export const metadata: Metadata = { title: "Missions" };

type Row = Awaited<ReturnType<typeof getAdminMissions>>[number];

const FIELDS_EXAMPLE = `[
  {
    "key": "probleme",
    "type": "long_text",
    "label": "Quel problème résous-tu ?",
    "required": true,
    "placeholder": "Décris le problème en trois phrases."
  },
  {
    "key": "cible",
    "type": "single_choice",
    "label": "Qui est ta cible principale ?",
    "options": ["Particuliers", "Entreprises", "Les deux"],
    "required": true
  }
]`;

export default async function AdminMissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ parcours?: string }>;
}) {
  await requireRole("admin", "/admin/missions");
  const { parcours } = await searchParams;
  const [missions, pathways] = await Promise.all([getAdminMissions(parcours), getAdminPathways()]);

  const fields = (mission?: Row) => (
    <>
      {mission && <input type="hidden" name="id" value={mission.id} />}
      <Select
        name="pathwayId"
        label="Parcours"
        defaultValue={mission?.pathwayId ?? parcours ?? ""}
        required
      >
        <option value="">Choisir un parcours…</option>
        {pathways.map((pathway) => (
          <option key={pathway.id} value={pathway.id}>
            {pathway.title}
          </option>
        ))}
      </Select>
      <Input name="title" label="Titre" defaultValue={mission?.title} required />
      <Input name="slug" label="Identifiant d'URL" defaultValue={mission?.slug} />
      <Textarea
        name="objective"
        label="Objectif"
        rows={2}
        defaultValue={mission?.objective}
        hint="Ce que l'utilisateur va accomplir concrètement."
      />
      <Textarea
        name="explanation"
        label="Explication"
        rows={4}
        defaultValue={mission?.explanation}
        hint="Pourquoi cette mission compte."
      />
      <Textarea
        name="instructions"
        label="Instructions"
        rows={5}
        defaultValue={mission?.instructions.join("\n")}
        hint="Une instruction par ligne."
      />
      <Textarea
        name="fields"
        label="Champs de réponse (JSON)"
        rows={12}
        defaultValue={
          mission ? JSON.stringify(mission.fields, null, 2) : FIELDS_EXAMPLE
        }
        hint="Types disponibles : short_text, long_text, single_choice, multi_choice, number, date, file."
        className="font-mono"
      />
      <Textarea
        name="tips"
        label="Conseils"
        rows={3}
        defaultValue={mission?.tips.join("\n")}
        hint="Un conseil par ligne."
      />
      <Textarea
        name="pitfalls"
        label="Pièges à éviter"
        rows={3}
        defaultValue={mission?.pitfalls.join("\n")}
        hint="Un piège par ligne."
      />
      <Textarea
        name="checklist"
        label="Checklist"
        rows={3}
        defaultValue={mission?.checklist.join("\n")}
        hint="Un point par ligne."
      />
      <Input
        name="resultLabel"
        label="Nom du résultat produit"
        defaultValue={mission?.resultLabel}
        hint="Par exemple : Ta proposition de valeur."
      />
      <Input
        type="number"
        name="estimatedMinutes"
        label="Durée estimée (minutes)"
        defaultValue={mission?.estimatedMinutes ?? 20}
      />
      <Input type="number" name="position" label="Position" defaultValue={mission?.position ?? 0} />
      <Checkbox name="aiAssist" label="Assistance IA proposée" defaultChecked={mission?.aiAssist} />
      <Checkbox
        name="isPublished"
        label="Publiée"
        defaultChecked={mission?.isPublished ?? true}
      />
    </>
  );

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Mission",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-ivoire">
            <span className="font-mono text-xs text-ivoire-faint">{row.position + 1}.</span>{" "}
            {row.title}
          </p>
          <p className="truncate text-xs text-ivoire-faint">{row.objective}</p>
        </div>
      ),
    },
    {
      key: "pathway",
      header: "Parcours",
      secondary: true,
      render: (row) => <span className="text-xs">{row.pathway.title}</span>,
    },
    {
      key: "fields",
      header: "Champs",
      render: (row) => <span className="font-mono text-xs">{row.fields.length}</span>,
    },
    {
      key: "duration",
      header: "Durée",
      secondary: true,
      render: (row) => <span className="text-xs">{formatMinutes(row.estimatedMinutes)}</span>,
    },
    {
      key: "state",
      header: "État",
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-1.5 lg:justify-start">
          {row.aiAssist && (
            <Badge tone="or">
              <Sparkles size={10} /> IA
            </Badge>
          )}
          <Badge tone={row.isPublished ? "feuillage" : "outline"}>
            {row.isPublished ? "Publiée" : "Brouillon"}
          </Badge>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <EntityEditor
          action={saveMissionAction}
          title={`Modifier « ${row.title} »`}
          trigger={<EditTrigger />}
          wide
        >
          {fields(row)}
        </EntityEditor>
      ),
    },
  ];

  const current = parcours ? pathways.find((p) => p.id === parcours) : null;

  return (
    <PageTransition className="mx-auto max-w-6xl space-y-6">
      <SectionHeading
        eyebrow="Contenu"
        title="Missions"
        description={
          current
            ? `Missions du parcours « ${current.title} ».`
            : "Les étapes concrètes qui composent chaque parcours."
        }
        action={
          <EntityEditor
            action={saveMissionAction}
            title="Nouvelle mission"
            description="Les champs de réponse définissent ce que l'utilisateur produit."
            wide
          >
            {fields()}
          </EntityEditor>
        }
      />

      <nav aria-label="Filtrer par parcours" className="flex flex-wrap gap-2">
        <Link
          href="/admin/missions"
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            !parcours
              ? "border-or bg-or/12 text-or-vif"
              : "border-ivoire/12 text-ivoire-dim hover:border-or/30"
          }`}
        >
          Tous
        </Link>
        {pathways.map((pathway) => (
          <Link
            key={pathway.id}
            href={`/admin/missions?parcours=${pathway.id}`}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              parcours === pathway.id
                ? "border-or bg-or/12 text-or-vif"
                : "border-ivoire/12 text-ivoire-dim hover:border-or/30"
            }`}
          >
            {pathway.title}
          </Link>
        ))}
      </nav>

      <DataTable
        columns={columns}
        rows={missions}
        empty="Aucune mission."
        title={(row) => row.title}
      />
    </PageTransition>
  );
}
