"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { savePath } from "@/lib/actions/paths-admin";

export type PathValues = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  accessType: "FREE" | "PREMIUM" | "CREDITS";
  creditCost: number;
  isPublished: boolean;
  difficulty: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  estimatedMinutes: number | null;
  resultSummary: string;
  deliverableType: string;
  wizardType: string;
  categoryId: string | null;
  displayOrder: number;
};

const inputCls = "w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or";
const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim";

export function PathForm({
  initial,
  categories,
  wizardTypes,
}: {
  initial: PathValues;
  categories: { id: string; name: string }[];
  wizardTypes: { type: string; title: string }[];
}) {
  const router = useRouter();
  const isNew = !initial.id;
  const [v, setV] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof PathValues>(k: K, value: PathValues[K]) => setV((p) => ({ ...p, [k]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await savePath(v);
      if (!res.ok) return setMsg({ ok: false, text: res.error });
      if (isNew) return router.push(`/admin/parcours/${res.id}`);
      setMsg({ ok: true, text: "Enregistré." });
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Titre</label>
          <input className={inputCls} value={v.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Slug (adresse)</label>
          <input className={inputCls} value={v.slug} onChange={(e) => set("slug", e.target.value)} disabled={!isNew} />
          {!isNew && <p className="mt-1 text-xs text-ivoire-dim">Non modifiable : l'adresse du parcours ne change pas.</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea className={inputCls} rows={3} value={v.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Résultat concret (« à la fin, vous aurez… »)</label>
        <textarea className={inputCls} rows={2} value={v.resultSummary} onChange={(e) => set("resultSummary", e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Accès</label>
          <select className={inputCls} value={v.accessType} onChange={(e) => set("accessType", e.target.value as PathValues["accessType"])}>
            <option value="FREE">Gratuit</option>
            <option value="PREMIUM">Premium</option>
            <option value="CREDITS">Xwé Crédits</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Coût (crédits)</label>
          <input className={inputCls} type="number" min={0} value={v.creditCost} disabled={v.accessType !== "CREDITS"} onChange={(e) => set("creditCost", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Niveau</label>
          <select className={inputCls} value={v.difficulty} onChange={(e) => set("difficulty", e.target.value as PathValues["difficulty"])}>
            <option value="DEBUTANT">Débutant</option>
            <option value="INTERMEDIAIRE">Intermédiaire</option>
            <option value="AVANCE">Avancé</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Durée estimée (min)</label>
          <input className={inputCls} type="number" min={1} value={v.estimatedMinutes ?? ""} onChange={(e) => set("estimatedMinutes", e.target.value === "" ? null : Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Livrable</label>
          <input className={inputCls} placeholder="ex : Document Word" value={v.deliverableType} onChange={(e) => set("deliverableType", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Ordre d'affichage</label>
          <input className={inputCls} type="number" min={0} value={v.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Catégorie</label>
          <select className={inputCls} value={v.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)}>
            <option value="">— aucune —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Projet guidé lié</label>
          <select className={inputCls} value={v.wizardType} onChange={(e) => set("wizardType", e.target.value)}>
            <option value="">— aucun —</option>
            {wizardTypes.map((w) => <option key={w.type} value={w.type}>{w.title}</option>)}
          </select>
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-ivoire">
        <input type="checkbox" checked={v.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="mt-0.5 h-4 w-4 accent-braise" />
        <span>
          Publié
          <span className="mt-0.5 block text-xs text-ivoire-dim">Non publié = visible uniquement par les administrateurs.</span>
        </span>
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>{isNew ? "Créer le parcours" : "Enregistrer"}</Button>
        {msg && <span className={`text-sm ${msg.ok ? "text-ivoire-dim" : "text-red-400"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
