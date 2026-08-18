"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createQuizStage, updateQuizStage, type QuizStageFormData } from "@/lib/actions/quiz-stages";

export function QuizStageForm({
  mode,
  stageId,
  initial,
}: {
  mode: "create" | "edit";
  stageId?: string;
  initial?: Partial<QuizStageFormData>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [level, setLevel] = useState<QuizStageFormData["level"]>(initial?.level ?? "DEBUTANT");
  const [questionCount, setQuestionCount] = useState(initial?.questionCount ?? 10);
  const [order, setOrder] = useState(initial?.order ?? 1);
  const [isPremium, setIsPremium] = useState(initial?.isPremium ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const data: QuizStageFormData = { title, description, topic, level, questionCount, order, isPremium };

    startTransition(async () => {
      try {
        if (mode === "create") await createQuizStage(data);
        else if (stageId) await updateQuizStage(stageId, data);
      } catch (err) {
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
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Description</label>
        <textarea
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Thème pour la génération IA
        </label>
        <textarea
          required
          rows={2}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex : les bonnes pratiques de prompt engineering pour bien utiliser les IA génératives"
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
        <p className="mt-1.5 text-xs text-ivoire-dim">
          C'est ce texte qui guide Gemini pour générer les questions — soyez précis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Niveau</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as QuizStageFormData["level"])}
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
          >
            <option value="DEBUTANT">Débutant</option>
            <option value="INTERMEDIAIRE">Intermédiaire</option>
            <option value="AVANCE">Avancé</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
            Nombre de questions
          </label>
          <input
            type="number"
            min={5}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Ordre</label>
          <input
            type="number"
            min={1}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ivoire">
        <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="h-4 w-4 accent-braise" />
        Premium
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : mode === "create" ? "Créer l'étape" : "Enregistrer"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/quiz")}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
