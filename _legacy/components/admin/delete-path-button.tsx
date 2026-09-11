"use client";

import { Trash2 } from "lucide-react";
import { deleteLearningPath } from "@/lib/actions/learning-paths";
import { useTransition } from "react";

export function DeletePathButton({ pathId }: { pathId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Supprimer ce parcours ? Cette action est irréversible.")) return;
    startTransition(() => deleteLearningPath(pathId));
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-ivoire-dim hover:text-red-400 disabled:opacity-40 transition-colors"
      title="Supprimer"
    >
      <Trash2 size={15} />
    </button>
  );
}
