"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPathMissions } from "@/lib/actions/paths-admin";

type M = { id: string; title: string };

export function PathMissionsManager({ pathId, allMissions, initialIds }: { pathId: string; allMissions: M[]; initialIds: string[] }) {
  const router = useRouter();
  const byId = new Map(allMissions.map((m) => [m.id, m]));
  const [ids, setIds] = useState(initialIds.filter((id) => byId.has(id)));
  const [toAdd, setToAdd] = useState("");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const available = allMissions.filter((m) => !ids.includes(m.id));

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    setIds(next);
  }

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await setPathMissions(pathId, ids);
      setMsg(res.ok ? { ok: true, text: "Ordre enregistré." } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <ol className="space-y-2">
        {ids.map((id, i) => (
          <li key={id} className="flex items-center gap-2 rounded-lg border border-ivoire/10 bg-noir-elevated px-3 py-2 text-sm text-ivoire">
            <span className="w-6 font-mono text-xs text-or">{i + 1}</span>
            <span className="flex-1">{byId.get(id)?.title}</span>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" className="p-1 text-ivoire-dim hover:text-or disabled:opacity-30"><ArrowUp size={15} /></button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === ids.length - 1} aria-label="Descendre" className="p-1 text-ivoire-dim hover:text-or disabled:opacity-30"><ArrowDown size={15} /></button>
            <button type="button" onClick={() => setIds(ids.filter((x) => x !== id))} aria-label="Retirer" className="p-1 text-ivoire-dim hover:text-red-400"><X size={15} /></button>
          </li>
        ))}
        {ids.length === 0 && <li className="text-sm text-ivoire-dim">Aucune mission dans ce parcours.</li>}
      </ol>

      <div className="flex gap-2">
        <select value={toAdd} onChange={(e) => setToAdd(e.target.value)} className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or">
          <option value="">Ajouter une mission…</option>
          {available.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <Button size="sm" variant="secondary" disabled={!toAdd} onClick={() => { setIds([...ids, toAdd]); setToAdd(""); }}>Ajouter</Button>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={isPending}>Enregistrer l'ordre</Button>
        {msg && <span className={`text-sm ${msg.ok ? "text-ivoire-dim" : "text-red-400"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
