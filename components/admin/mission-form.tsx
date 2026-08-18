"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StringListEditor, StepsEditor, type StepItem } from "@/components/admin/list-editors";
import { createMission, updateMission, type MissionFormData } from "@/lib/actions/missions";

interface CategoryOption {
  id: string;
  name: string;
}
interface ToolOption {
  id: string;
  name: string;
}

export function MissionForm({
  mode,
  missionId,
  initial,
  categories,
  tools,
}: {
  mode: "create" | "edit";
  missionId?: string;
  initial?: Partial<MissionFormData>;
  categories: CategoryOption[];
  tools: ToolOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [level, setLevel] = useState<MissionFormData["level"]>(initial?.level ?? "DEBUTANT");
  const [estimatedMinutes, setEstimatedMinutes] = useState(initial?.estimatedMinutes ?? 60);
  const [recommendedTools, setRecommendedTools] = useState<string[]>(initial?.recommendedTools ?? []);
  const [steps, setSteps] = useState<StepItem[]>((initial?.steps as StepItem[]) ?? []);
  const [tips, setTips] = useState<string[]>(initial?.tips ?? []);
  const [commonMistakes, setCommonMistakes] = useState<string[]>(initial?.commonMistakes ?? []);
  const [checklist, setChecklist] = useState<string[]>(initial?.checklist ?? []);
  const [isPremium, setIsPremium] = useState(initial?.isPremium ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);

  const toggleTool = (id: string) => {
    setRecommendedTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data: MissionFormData = {
      slug,
      title,
      description,
      categoryId,
      level,
      estimatedMinutes,
      recommendedTools,
      steps,
      tips,
      commonMistakes,
      checklist,
      isPremium,
      isPublished,
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createMission(data);
        } else if (missionId) {
          await updateMission(missionId, data);
        }
      } catch (err) {
        // Server actions throw NEXT_REDIRECT on success — that's expected
        // and not a real error, so only surface genuine failures.
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setError(err.message);
        } else if (!(err instanceof Error)) {
          throw err;
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Titre</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
            Slug (URL)
          </label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ex-nom-de-la-mission"
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Description
        </label>
        <textarea
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
            Catégorie
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
            Niveau
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as MissionFormData["level"])}
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
          >
            <option value="DEBUTANT">Débutant</option>
            <option value="INTERMEDIAIRE">Intermédiaire</option>
            <option value="AVANCE">Avancé</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
            Durée (minutes)
          </label>
          <input
            type="number"
            min={5}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Outils recommandés
        </label>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggleTool(tool.id)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                recommendedTools.includes(tool.id)
                  ? "border-or bg-or/10 text-ivoire"
                  : "border-ivoire/15 text-ivoire-dim"
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      <StepsEditor steps={steps} onChange={setSteps} />
      <StringListEditor label="Conseils" items={tips} onChange={setTips} />
      <StringListEditor label="Erreurs fréquentes" items={commonMistakes} onChange={setCommonMistakes} />
      <StringListEditor label="Checklist" items={checklist} onChange={setChecklist} />

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-ivoire">
          <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="h-4 w-4 accent-braise" />
          Premium
        </label>
        <label className="flex items-center gap-2 text-sm text-ivoire">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 accent-braise" />
          Publiée
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : mode === "create" ? "Créer la mission" : "Enregistrer les modifications"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/missions")}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
