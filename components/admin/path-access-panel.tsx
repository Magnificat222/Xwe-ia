"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { grantPathAccessByEmail, revokePathGrant } from "@/lib/actions/paths-admin";

type Row = { id: string; email: string; source: "CREDITS" | "ADMIN_GRANT"; createdAt: string };

export function PathAccessPanel({ pathId, rows }: { pathId: string; rows: Row[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function grant() {
    setMsg(null);
    startTransition(async () => {
      const res = await grantPathAccessByEmail(pathId, email);
      if (!res.ok) return setMsg({ ok: false, text: res.error });
      setEmail("");
      router.refresh();
    });
  }

  function revoke(id: string) {
    if (!window.confirm("Retirer cet accès offert ?")) return;
    startTransition(async () => {
      const res = await revokePathGrant(id);
      if (!res.ok) setMsg({ ok: false, text: res.error });
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail de l'utilisateur à qui offrir l'accès"
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or" />
        <Button size="sm" onClick={grant} disabled={isPending || !email}>Offrir</Button>
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-ivoire-dim" : "text-red-400"}`}>{msg.text}</p>}
      <ul className="space-y-1.5 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between text-ivoire">
            <span>
              {r.email}
              <span className="ml-2 text-xs text-ivoire-dim">
                {r.source === "CREDITS" ? "acheté avec crédits" : "offert"} · {new Date(r.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </span>
            {r.source === "ADMIN_GRANT" && (
              <button onClick={() => revoke(r.id)} className="text-xs text-ivoire-dim hover:text-red-400">Retirer</button>
            )}
          </li>
        ))}
        {rows.length === 0 && <li className="text-ivoire-dim">Aucun accès individuel.</li>}
      </ul>
    </div>
  );
}
