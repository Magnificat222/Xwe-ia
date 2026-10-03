"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveCreditPack } from "@/lib/actions/payments-admin";

export type PackValues = {
  id?: string;
  code: string;
  name: string;
  credits: number;
  priceXof: number;
  isActive: boolean;
  displayOrder: number;
};

const inputCls = "w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or";

export function CreditPackForm({ initial, isNew = false }: { initial: PackValues; isNew?: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof PackValues>(k: K, value: PackValues[K]) => setV((p) => ({ ...p, [k]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await saveCreditPack(v);
      if (!res.ok) return setMsg({ ok: false, text: res.error });
      setMsg({ ok: true, text: "Enregistré." });
      if (isNew) setV(initial);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-card border border-ivoire/10 bg-noir-elevated p-4 sm:grid-cols-6">
      <input className={`${inputCls} sm:col-span-2`} placeholder="Nom" value={v.name} onChange={(e) => set("name", e.target.value)} />
      <input className={inputCls} placeholder="code" value={v.code} onChange={(e) => set("code", e.target.value)} disabled={!isNew} />
      <input className={inputCls} type="number" min={1} placeholder="Crédits" value={v.credits || ""} onChange={(e) => set("credits", Number(e.target.value))} />
      <input className={inputCls} type="number" min={1} placeholder="Prix FCFA" value={v.priceXof || ""} onChange={(e) => set("priceXof", Number(e.target.value))} />
      <input className={inputCls} type="number" min={0} placeholder="Ordre" value={v.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} />
      <label className="flex items-center gap-2 text-sm text-ivoire sm:col-span-3">
        <input type="checkbox" checked={v.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-braise" />
        Actif (visible par les utilisateurs)
      </label>
      <div className="flex items-center gap-3 sm:col-span-3 sm:justify-end">
        {msg && <span className={`text-xs ${msg.ok ? "text-ivoire-dim" : "text-red-400"}`}>{msg.text}</span>}
        <Button type="submit" size="sm" disabled={isPending}>{isNew ? "Ajouter le pack" : "Enregistrer"}</Button>
      </div>
    </form>
  );
}
