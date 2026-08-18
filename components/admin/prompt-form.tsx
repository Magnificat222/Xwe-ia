"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StringListEditor } from "@/components/admin/list-editors";
import { createPrompt, updatePrompt, type PromptFormData } from "@/lib/actions/prompts";

interface CategoryOption { id: string; name: string; }
interface ToolOption { id: string; name: string; }

export function PromptForm({
  mode,
  promptId,
  initial,
  categories,
  tools,
}: {
  mode: "create" | "edit";
  promptId?: string;
  initial?: Partial<PromptFormData>;
  categories: CategoryOption[];
  tools: ToolOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [recommendedTools, setRecommendedTools] = useState<string[]>(initial?.recommendedTools ?? []);
  const [isPremium, setIsPremium] = useState(initial?.isPremium ?? false);

  const toggleTool = (id: string) => {
    setRecommendedTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const data: PromptFormData = { title, content, categoryId, tags, recommendedTools, isPremium };

    startTransition(async () => {
      try {
        if (mode === "create") await createPrompt(data);
        else if (promptId) await updatePrompt(promptId, data);
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
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Contenu du prompt
        </label>
        <textarea
          required
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Catégorie</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <StringListEditor label="Tags" items={tags} onChange={setTags} />

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Outils recommandés
        </label>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggleTool(tool.id)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                recommendedTools.includes(tool.id) ? "border-or bg-or/10 text-ivoire" : "border-ivoire/15 text-ivoire-dim"
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ivoire">
        <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="h-4 w-4 accent-braise" />
        Premium
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : mode === "create" ? "Créer le prompt" : "Enregistrer"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/prompts")}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
