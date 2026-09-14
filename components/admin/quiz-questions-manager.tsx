"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizQuestionForm } from "@/components/admin/quiz-question-form";
import { DeleteQuizQuestionButton } from "@/components/admin/delete-quiz-question-button";

interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function QuizQuestionsManager({ stageId, initialQuestions }: { stageId: string; initialQuestions: QuestionItem[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const questions = initialQuestions;
  const editing = questions.find((q) => q.id === editingId);

  return (
    <div className="space-y-4">
      {!adding && !editing && (
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={14} /> Ajouter une question
        </Button>
      )}

      {adding && (
        <QuizQuestionForm stageId={stageId} onDone={() => setAdding(false)} />
      )}

      {editing && (
        <QuizQuestionForm stageId={stageId} editing={editing} onDone={() => setEditingId(null)} />
      )}

      <div className="space-y-2">
        {questions.length === 0 && !adding && (
          <p className="text-sm text-ivoire-dim">Aucune question pour l'instant.</p>
        )}
        {questions.map((q) => (
          <div key={q.id} className="flex items-start justify-between gap-3 rounded-lg border border-ivoire/10 p-3.5">
            <div>
              <p className="text-sm text-ivoire">{q.question}</p>
              <p className="mt-1 text-xs text-ivoire-dim">
                Bonne réponse : {q.options[q.correctIndex]}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => setEditingId(q.id)} className="text-ivoire-dim hover:text-or">
                <Pencil size={15} />
              </button>
              <DeleteQuizQuestionButton id={q.id} stageId={stageId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
