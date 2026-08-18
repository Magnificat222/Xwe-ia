"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletePrompt } from "@/lib/actions/prompts";

export function DeletePromptButton({ promptId }: { promptId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Supprimer ce prompt définitivement ?")) return;
    startTransition(() => {
      deletePrompt(promptId);
    });
  };

  return (
    <button onClick={handleDelete} disabled={isPending} className="text-ivoire-dim hover:text-red-400 disabled:opacity-40">
      <Trash2 size={15} />
    </button>
  );
}
