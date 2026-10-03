"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles, Lock } from "lucide-react";

interface PromptItem {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
  isPremium: boolean;
  isLocked: boolean;
  recommendedToolNames: string[];
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prompts")
      .then((res) => (res.ok ? res.json() : { prompts: [] }))
      .then((data: { prompts: PromptItem[] }) => setPrompts(data.prompts))
      .catch(() => setPrompts([]));
  }, []);

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Bibliothèque</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Prompts optimisés</h1>
        <p className="mt-2 text-ivoire-dim">
          Copiez, adaptez les variables entre crochets, et lancez-vous.
        </p>
      </div>

      {prompts.length === 0 && (
        <p className="text-sm text-ivoire-dim">
          Aucun prompt publié pour l'instant — lance `npm run db:seed`.
        </p>
      )}

      <div className="space-y-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-base text-ivoire">{prompt.title}</h3>
              {prompt.isPremium && <Badge tone="gold">Premium</Badge>}
            </div>

            {prompt.isLocked ? (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-noir p-3">
                <p className="flex items-center gap-2 text-xs text-ivoire-dim">
                  <Lock size={14} className="text-or" />
                  Réservé aux membres Premium
                </p>
                <Link href="/#tarifs">
                  <Button size="sm">Passer Premium</Button>
                </Link>
              </div>
            ) : (
              <p className="mb-3 rounded-lg bg-noir p-3 font-mono text-xs leading-relaxed text-ivoire-dim">
                {prompt.content}
              </p>
            )}

            {prompt.recommendedToolNames.length > 0 && (
              <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-ivoire-dim">
                <Sparkles size={13} className="text-or" />
                <span>Plus efficace avec :</span>
                {prompt.recommendedToolNames.map((name) => (
                  <Badge key={name} tone="feuillage">{name}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              {!prompt.isLocked && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopy(prompt.id, prompt.content!)}
                >
                  {copiedId === prompt.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === prompt.id ? "Copié" : "Copier"}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
