"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteQuizStage } from "@/lib/actions/quiz-stages";

export function DeleteQuizStageButton({ stageId }: { stageId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Supprimer cette étape de quiz définitivement ?")) return;
    startTransition(() => {
      deleteQuizStage(stageId);
    });
  };

  return (
    <button onClick={handleDelete} disabled={isPending} className="text-ivoire-dim hover:text-red-400 disabled:opacity-40">
      <Trash2 size={15} />
    </button>
  );
}
