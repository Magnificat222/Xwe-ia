"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteQuizQuestion } from "@/lib/actions/quiz-questions";

export function DeleteQuizQuestionButton({ id, stageId }: { id: string; stageId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Supprimer cette question ?")) return;
        startTransition(() => deleteQuizQuestion(id, stageId));
      }}
      disabled={isPending}
      className="text-ivoire-dim hover:text-red-400 disabled:opacity-40"
    >
      <Trash2 size={15} />
    </button>
  );
}
