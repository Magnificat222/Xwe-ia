"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { createEbook, updateEbook, type EbookFormData } from "@/lib/actions/ebooks";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function EbookForm({
  mode,
  ebookId,
  initial,
}: {
  mode: "create" | "edit";
  ebookId?: string;
  initial?: Partial<EbookFormData> & { hasExistingFile?: boolean };
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isPremium, setIsPremium] = useState(initial?.isPremium ?? true);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | undefined>(undefined);

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    if (file.size > 8_000_000) {
      setError("Le fichier est trop volumineux (8 Mo max).");
      return;
    }
    setError(null);
    setFileName(file.name);
    setFileData(await fileToBase64(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "create" && !fileData) {
      setError("Merci de choisir un fichier PDF.");
      return;
    }

    const data: EbookFormData = { title, description, isPremium, fileData };

    startTransition(async () => {
      try {
        if (mode === "create") await createEbook(data);
        else if (ebookId) await updateEbook(ebookId, data);
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
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Description</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Fichier PDF {mode === "edit" && "(laisser vide pour garder le fichier actuel)"}
        </label>
        <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={handlePickFile} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-ivoire/15 px-4 py-2.5 text-sm text-ivoire-dim hover:border-or/40 hover:text-or"
        >
          {fileName ? <FileText size={15} /> : <Upload size={15} />}
          {fileName ?? (initial?.hasExistingFile ? "Remplacer le PDF" : "Choisir un PDF")}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-ivoire">
        <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="h-4 w-4 accent-braise" />
        Premium
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : mode === "create" ? "Ajouter l'ebook" : "Enregistrer"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/ebooks")}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
