"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Config = {
  premiumPriceXof: number;
  instructions: string | null;
  providers: { provider: "MTN_MOMO" | "CELTIS_MONEY"; number: string | null; accountName: string | null }[];
  packs: { code: string; name: string; credits: number; priceXof: number }[];
};

const LABEL = { MTN_MOMO: "MTN Mobile Money", CELTIS_MONEY: "Celtis Money" } as const;
const inputCls = "w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or";

// Amounts shown here are for display only: the server recomputes the real
// amount from the pack / settings and ignores anything sent by the browser.
export function PaymentForm({ config, premiumPeriodDays }: { config: Config; premiumPeriodDays: number }) {
  const router = useRouter();
  const [choice, setChoice] = useState<string>(config.packs[0] ? `pack:${config.packs[0].code}` : "premium");
  const [provider, setProvider] = useState(config.providers[0]?.provider ?? "MTN_MOMO");
  const [payerPhone, setPayerPhone] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const current = config.providers.find((p) => p.provider === provider);
  const pack = choice.startsWith("pack:") ? config.packs.find((p) => `pack:${p.code}` === choice) : null;
  const amount = pack ? pack.priceXof : config.premiumPriceXof;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const body = pack
      ? { purpose: "CREDIT_PACK", packCode: pack.code, provider, payerPhone, transactionRef }
      : { purpose: "PREMIUM", provider, payerPhone, transactionRef };
    const res = await fetch("/api/payments/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error ?? "Erreur." });
    setTransactionRef("");
    setMsg({ ok: true, text: "Demande envoyée. Elle sera validée après vérification de votre paiement." });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ivoire-dim">1. Que voulez-vous acheter ?</p>
        {config.packs.map((p) => (
          <label key={p.code} className="flex cursor-pointer items-center justify-between rounded-lg border border-ivoire/15 px-3 py-2.5 text-sm text-ivoire has-[:checked]:border-or">
            <span className="flex items-center gap-2">
              <input type="radio" name="choice" checked={choice === `pack:${p.code}`} onChange={() => setChoice(`pack:${p.code}`)} className="accent-braise" />
              {p.name} — {p.credits} crédits
            </span>
            <span className="text-ivoire-dim">{p.priceXof.toLocaleString("fr-FR")} FCFA</span>
          </label>
        ))}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-ivoire/15 px-3 py-2.5 text-sm text-ivoire has-[:checked]:border-or">
          <span className="flex items-center gap-2">
            <input type="radio" name="choice" checked={choice === "premium"} onChange={() => setChoice("premium")} className="accent-braise" />
            Premium — {premiumPeriodDays} jours
          </span>
          <span className="text-ivoire-dim">{config.premiumPriceXof.toLocaleString("fr-FR")} FCFA</span>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ivoire-dim">2. Envoyez {amount.toLocaleString("fr-FR")} FCFA</p>
        <div className="flex gap-2">
          {config.providers.map((p) => (
            <button
              type="button"
              key={p.provider}
              onClick={() => setProvider(p.provider)}
              className={`rounded-lg border px-3 py-2 text-sm ${provider === p.provider ? "border-or text-ivoire" : "border-ivoire/15 text-ivoire-dim"}`}
            >
              {LABEL[p.provider]}
            </button>
          ))}
        </div>
        {current && (
          <p className="rounded-lg bg-noir px-3 py-2.5 text-sm text-ivoire">
            Numéro : <span className="font-mono text-or">{current.number}</span>
            {current.accountName ? ` (${current.accountName})` : ""}
          </p>
        )}
        {config.instructions && <p className="text-xs text-ivoire-dim">{config.instructions}</p>}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ivoire-dim">3. Confirmez votre paiement</p>
        <input className={inputCls} inputMode="tel" placeholder="Numéro avec lequel vous avez payé" value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} required />
        <input className={inputCls} placeholder="Référence / ID de la transaction (dans le SMS)" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} required />
      </div>

      <Button type="submit" size="lg" disabled={loading}>{loading ? "Envoi..." : "J'ai payé, envoyer la demande"}</Button>
      {msg && <p className={`text-sm ${msg.ok ? "text-ivoire-dim" : "text-red-400"}`}>{msg.text}</p>}
    </form>
  );
}
