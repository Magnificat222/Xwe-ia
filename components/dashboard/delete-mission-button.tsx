"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMission } from "@/lib/actions/missions";

export function DeleteMissionButton({ missionId }: { missionId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Supprimer cette mission définitivement ?")) return;
    startTransition(() => {
      deleteMission(missionId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-ivoire-dim hover:text-red-400 disabled:opacity-40"
    >
      <Trash2 size={15} />
    </button>
  );
}
