"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEbook } from "@/lib/actions/ebooks";

export function DeleteEbookButton({ ebookId }: { ebookId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Supprimer cet ebook définitivement ?")) return;
    startTransition(() => {
      deleteEbook(ebookId);
    });
  };

  return (
    <button onClick={handleDelete} disabled={isPending} className="text-ivoire-dim hover:text-red-400 disabled:opacity-40">
      <Trash2 size={15} />
    </button>
  );
}
