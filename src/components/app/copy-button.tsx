"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function CopyPromptButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { push } = useToast();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          push("Copié dans le presse-papiers.", "succes");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          push("Copie impossible sur ce navigateur.", "erreur");
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-ivoire-dim transition-colors hover:bg-or/10 hover:text-or"
    >
      {copied ? <Check size={13} className="text-feuillage-vif" /> : <Copy size={13} />}
      {copied ? "Copié" : label}
    </button>
  );
}
