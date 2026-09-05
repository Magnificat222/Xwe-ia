"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createLearningPath, updateLearningPath } from "@/lib/actions/learning-paths";
import type { LearningPathFormData } from "@/lib/actions/learning-paths";
import { GripVertical, X, Plus } from "lucide-react";

type Mission = { id: string; title: string; slug: string };

interface LearningPathFormProps {
  mode: "create" | "edit";
  pathId?: string;
  missions: Mission[]; // toutes les missions disponibles
  defaultValues?: Partial<LearningPathFormData> & {
    selectedMissions?: { id: string; title: string; order: number }[];
  };
}

const CATEGORIES = [
  { value: "business", label: "🚀 Business" },
  { value: "academique", label: "🎓 Académique" },
  { value: "reseaux", label: "📱 Réseaux sociaux" },
  { value: "ia", label: "🤖 Apprendre l'IA" },
  { value: "autre", label: "💡 Autre" },
];

const AUDIENCES = ["Entrepreneurs", "Étudiants", "Créateurs de contenu", "Professionnels", "Tous publics"];

export function LearningPathForm({ mode, pathId, missions, defaultValues }: LearningPathFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Missions sélectionnées (ordonnées)
  const [selectedMissions, setSelectedMissions] = useState<Mission[]>(
    (defaultValues?.selectedMissions ?? [])
      .sort((a, b) => a.order - b.order)
      .map((m) => ({ id: m.id, title: m.title, slug: "" }))
  );

  // Audiences sélectionnées
  const [audience, setAudience] = useState<string[]>(defaultValues?.targetAudience ?? []);

  const availableMissions = missions.filter(
    (m) => !selectedMissions.some((s) => s.id === m.id)
  );

  function addMission(mission: Mission) {
    setSelectedMissions((prev) => [...prev, mission]);
  }

  function removeMission(id: string) {
    setSelectedMissions((prev) => prev.filter((m) => m.id !== id));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setSelectedMissions((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }

  function moveDown(index: number) {
    setSelectedMissions((prev) => {
      if (index === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }

  function toggleAudience(val: string) {
    setAudience((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const priceRaw = fd.get("priceXof") as string;
    const hoursRaw = fd.get("estimatedHours") as string;

    const data: LearningPathFormData = {
      slug: (fd.get("slug") as string).trim().toLowerCase().replace(/\s+/g, "-"),
      title: (fd.get("title") as string).trim(),
      description: (fd.get("description") as string).trim(),
      icon: (fd.get("icon") as string).trim() || undefined,
      category: (fd.get("category") as string) || undefined,
      targetAudience: audience,
      difficulty: fd.get("difficulty") as LearningPathFormData["difficulty"],
      estimatedHours: hoursRaw ? parseInt(hoursRaw) : undefined,
      resultTitle: (fd.get("resultTitle") as string).trim() || undefined,
      resultDescription: (fd.get("resultDescription") as string).trim() || undefined,
      priceXof: priceRaw ? parseInt(priceRaw) : 0,
      isPremium: fd.get("isPremium") === "true",
      isPublished: fd.get("isPublished") === "on",
      missionIds: selectedMissions.map((m) => m.id),
    };

    try {
      if (mode === "create") {
        await createLearningPath(data);
      } else if (pathId) {
        await updateLearningPath(pathId, data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Informations de base */}
      <section className="space-y-4">
        <h2 className="font-display text-lg text-ivoire border-b border-ivoire/10 pb-2">
          Informations générales
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-ivoire-dim uppercase tracking-wide">Titre *</label>
            <input
              name="title"
              required
              defaultValue={defaultValues?.title}
              className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire placeholder:text-ivoire-dim/50 focus:border-or/50 focus:outline-none"
              placeholder="Créer mon Business Plan"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-ivoire-dim uppercase tracking-wide">Slug * (URL)</label>
            <input
              name="slug"
              required
              defaultValue={defaultValues?.slug}
              className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire placeholder:text-ivoire-dim/50 focus:border-or/50 focus:outline-none font-mono"
              placeholder="business-plan"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-ivoire-dim uppercase tracking-wide">Description *</label>
          <textarea
            name="description"
            required
            defaultValue={defaultValues?.description}
            rows={3}
            className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire placeholder:text-ivoire-dim/50 focus:border-or/50 focus:outline-none resize-none"
            placeholder="Ce que l'utilisateur va accomplir dans ce parcours..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-ivoire-dim uppercase tracking-wide">Icône (emoji)</label>
            <input
              name="icon"
              defaultValue={defaultValues?.icon}
              className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire focus:border-or/50 focus:outline-none"
              placeholder="🚀"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-ivoire-dim uppercase tracking-wide">Catégorie</label>
            <select
              name="category"
              defaultValue={defaultValues?.category ?? ""}
              className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire focus:border-or/50 focus:outline-none"
            >
              <option value="">— Choisir —</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-ivoire-dim uppercase tracking-wide">Difficulté</label>
            <select
              name="difficulty"
              defaultValue={defaultValues?.difficulty ?? "DEBUTANT"}
              className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire focus:border-or/50 focus:outline-none"
            >
              <option value="DEBUTANT">Débutant</option>
              <option value="INTERMEDIAIRE">Intermédiaire</option>
              <option value="AVANCE">Avancé</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-ivoire-dim uppercase tracking-wide">Public cible</label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAudience(a)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  audience.includes(a)
                    ? "border-or bg-or/10 text-or"
                    : "border-ivoire/20 text-ivoire-dim hover:border-or/40"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-ivoire-dim uppercase tracking-wide">Durée estimée (heures)</label>
          <input
            name="estimatedHours"
            type="number"
            min={1}
            defaultValue={defaultValues?.estimatedHours}
            className="w-32 rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire focus:border-or/50 focus:outline-none"
            placeholder="3"
          />
        </div>
      </section>

      {/* Résultat attendu */}
      <section className="space-y-4">
        <h2 className="font-display text-lg text-ivoire border-b border-ivoire/10 pb-2">
          Résultat attendu
        </h2>
        <div className="space-y-1">
          <label className="text-xs text-ivoire-dim uppercase tracking-wide">Titre du livrable</label>
          <input
            name="resultTitle"
            defaultValue={defaultValues?.resultTitle}
            className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire placeholder:text-ivoire-dim/50 focus:border-or/50 focus:outline-none"
            placeholder="Un Business Plan complet et téléchargeable"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ivoire-dim uppercase tracking-wide">Description du livrable</label>
          <textarea
            name="resultDescription"
            defaultValue={defaultValues?.resultDescription}
            rows={2}
            className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire placeholder:text-ivoire-dim/50 focus:border-or/50 focus:outline-none resize-none"
            placeholder="À la fin de ce parcours, vous disposerez de..."
          />
        </div>
      </section>

      {/* Tarification */}
      <section className="space-y-4">
        <h2 className="font-display text-lg text-ivoire border-b border-ivoire/10 pb-2">
          Tarification & accès
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-ivoire-dim uppercase tracking-wide">
              Prix en FCFA (0 = gratuit)
            </label>
            <input
              name="priceXof"
              type="number"
              min={0}
              step={100}
              defaultValue={defaultValues?.priceXof ?? 0}
              className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire focus:border-or/50 focus:outline-none font-mono"
              placeholder="2500"
            />
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-ivoire-dim uppercase tracking-wide">Accès Premium</label>
              <select
                name="isPremium"
                defaultValue={defaultValues?.isPremium ? "true" : "false"}
                className="w-full rounded-lg border border-ivoire/15 bg-noir-soft px-3 py-2 text-sm text-ivoire focus:border-or/50 focus:outline-none"
              >
                <option value="false">Non — achat unique ou gratuit</option>
                <option value="true">Oui — réservé aux membres Premium</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isPublished"
            id="isPublished"
            defaultChecked={defaultValues?.isPublished ?? false}
            className="h-4 w-4 accent-or"
          />
          <label htmlFor="isPublished" className="text-sm text-ivoire">
            Publier ce parcours (visible par les utilisateurs)
          </label>
        </div>
      </section>

      {/* Missions ordonnées */}
      <section className="space-y-4">
        <h2 className="font-display text-lg text-ivoire border-b border-ivoire/10 pb-2">
          Missions du parcours
        </h2>

        {/* Missions sélectionnées */}
        {selectedMissions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-ivoire-dim uppercase tracking-wide">
              Ordre des missions ({selectedMissions.length})
            </p>
            <ol className="space-y-1.5">
              {selectedMissions.map((mission, index) => (
                <li
                  key={mission.id}
                  className="flex items-center gap-3 rounded-lg border border-ivoire/10 bg-noir-soft px-3 py-2.5"
                >
                  <GripVertical size={14} className="text-ivoire-dim/40 shrink-0" />
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-or/30 font-mono text-xs text-or">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm text-ivoire">{mission.title}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="rounded p-1 text-ivoire-dim hover:text-ivoire disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === selectedMissions.length - 1}
                      className="rounded p-1 text-ivoire-dim hover:text-ivoire disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMission(mission.id)}
                      className="rounded p-1 text-ivoire-dim hover:text-red-400"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Missions disponibles à ajouter */}
        {availableMissions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-ivoire-dim uppercase tracking-wide">
              Ajouter une mission
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-ivoire/10 p-2">
              {availableMissions.map((mission) => (
                <button
                  key={mission.id}
                  type="button"
                  onClick={() => addMission(mission)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ivoire-dim hover:bg-noir-soft hover:text-ivoire transition-colors"
                >
                  <Plus size={13} className="text-or shrink-0" />
                  {mission.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedMissions.length === 0 && (
          <p className="text-sm text-ivoire-dim italic">
            Aucune mission ajoutée — sélectionnez des missions dans la liste ci-dessus.
          </p>
        )}
      </section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Enregistrement…" : mode === "create" ? "Créer le parcours" : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
