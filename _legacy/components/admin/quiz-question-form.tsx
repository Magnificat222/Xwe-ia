"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createQuizQuestion, updateQuizQuestion, type QuizQuestionFormData } from "@/lib/actions/quiz-questions";

export function QuizQuestionForm({
  stageId,
  editing,
  onDone,
}: {
  stageId: string;
  editing?: { id: string } & QuizQuestionFormData;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [question, setQuestion] = useState(editing?.question ?? "");
  const [options, setOptions] = useState<string[]>(editing?.options ?? ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(editing?.correctIndex ?? 0);
  const [explanation, setExplanation] = useState(editing?.explanation ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (options.some((o) => !o.trim())) {
      setError("Les 4 options doivent être remplies.");
      return;
    }

    const data: QuizQuestionFormData = { question, options, correctIndex, explanation };

    startTransition(async () => {
      if (editing) {
        await updateQuizQuestion(editing.id, stageId, data);
      } else {
        await createQuizQuestion(stageId, data);
      }
      onDone();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-ivoire/15 p-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Question</label>
        <textarea
          required
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Options — cochez la bonne réponse
        </label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                className="h-4 w-4 accent-braise"
              />
              <input
                required
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                className="flex-1 rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Explication (affichée après la réponse)
        </label>
        <textarea
          required
          rows={2}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Enregistrement..." : editing ? "Enregistrer" : "Ajouter la question"}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onDone}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
