"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { adjustCreditsAction, lookupUserCredits } from "@/lib/actions/payments-admin";

type Found = {
  user: { id: string; email: string; name: string | null };
  balance: number;
  transactions: { id: string; type: string; amount: number; balanceAfter: number; description: string | null; createdAt: string }[];
};

const inputCls = "w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or";

export function UserCreditsPanel() {
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function search() {
    setMsg(null);
    startTransition(async () => {
      const res = await lookupUserCredits(email);
      if (!res.ok) { setFound(null); return setMsg({ ok: false, text: res.error }); }
      setFound({ user: res.user, balance: res.balance, transactions: res.transactions });
    });
  }

  function adjust() {
    if (!found) return;
    const n = Number(amount);
    if (!Number.isInteger(n) || n === 0) return setMsg({ ok: false, text: "Montant entier non nul requis (négatif pour retirer)." });
    if (!window.confirm(`${n > 0 ? "Ajouter" : "Retirer"} ${Math.abs(n)} crédits à ${found.user.email} ?`)) return;
    setMsg(null);
    startTransition(async () => {
      const res = await adjustCreditsAction({ userId: found.user.id, amount: n, reason });
      if (!res.ok) return setMsg({ ok: false, text: res.error });
      setAmount(""); setReason("");
      setMsg({ ok: true, text: `Fait. Nouveau solde : ${res.balance}.` });
      const refreshed = await lookupUserCredits(found.user.email);
      if (refreshed.ok) setFound({ user: refreshed.user, balance: refreshed.balance, transactions: refreshed.transactions });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex max-w-md gap-2">
        <input className={inputCls} type="email" placeholder="E-mail de l'utilisateur" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button size="sm" onClick={search} disabled={isPending || !email}>Chercher</Button>
      </div>

      {found && (
        <div className="space-y-4 rounded-card border border-ivoire/10 bg-noir-elevated p-4">
          <p className="text-sm text-ivoire">
            {found.user.name ?? "—"} · <span className="text-ivoire-dim">{found.user.email}</span> — solde :{" "}
            <span className="font-display text-or">{found.balance}</span> Xwé Crédits
          </p>
          <div className="grid max-w-md gap-2">
            <input className={inputCls} type="number" placeholder="Montant (ex : 50 ou -20)" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input className={inputCls} placeholder="Motif obligatoire (journalisé)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button size="sm" onClick={adjust} disabled={isPending}>Appliquer l'ajustement</Button>
          </div>
          <ul className="space-y-1 text-xs text-ivoire-dim">
            {found.transactions.map((t) => (
              <li key={t.id}>
                {new Date(t.createdAt).toLocaleDateString("fr-FR")} · {t.type} · {t.amount > 0 ? "+" : ""}{t.amount} → {t.balanceAfter}
                {t.description ? ` · ${t.description}` : ""}
              </li>
            ))}
            {found.transactions.length === 0 && <li>Aucune opération.</li>}
          </ul>
        </div>
      )}
      {msg && <p className={`text-sm ${msg.ok ? "text-ivoire-dim" : "text-red-400"}`}>{msg.text}</p>}
    </div>
  );
}
