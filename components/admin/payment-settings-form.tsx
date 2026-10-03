"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updatePaymentSettings } from "@/lib/actions/payments-admin";

type Initial = {
  manualPaymentsEnabled: boolean;
  mtnMomoNumber: string;
  mtnMomoAccountName: string;
  celtisMoneyNumber: string;
  celtisMoneyAccountName: string;
  paymentInstructions: string;
  premiumDurationDays: number;
};

const inputCls =
  "w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or";
const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim";

export function PaymentSettingsForm({ initial }: { initial: Initial }) {
  const [v, setV] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof Initial>(k: K, value: Initial[K]) => setV((p) => ({ ...p, [k]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await updatePaymentSettings(v);
      setMsg(res.ok ? { ok: true, text: "Enregistré." } : { ok: false, text: res.error });
    });
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-5">
      <h2 className="font-display text-xl text-ivoire">Paiements manuels</h2>

      <label className="flex items-start gap-2.5 text-sm text-ivoire">
        <input type="checkbox" checked={v.manualPaymentsEnabled} onChange={(e) => set("manualPaymentsEnabled", e.target.checked)} className="mt-0.5 h-4 w-4 accent-braise" />
        <span>
          Paiements ouverts
          <span className="mt-0.5 block text-xs text-ivoire-dim">
            Les utilisateurs peuvent déclarer un paiement. Rien n'est crédité avant votre validation.
          </span>
        </span>
      </label>

      <div>
        <label className={labelCls}>Numéro MTN Mobile Money</label>
        <input className={inputCls} inputMode="tel" value={v.mtnMomoNumber} onChange={(e) => set("mtnMomoNumber", e.target.value)} placeholder="+229 ..." />
        <input className={`${inputCls} mt-2`} value={v.mtnMomoAccountName} onChange={(e) => set("mtnMomoAccountName", e.target.value)} placeholder="Nom affiché du compte" />
      </div>
      <div>
        <label className={labelCls}>Numéro Celtis Money</label>
        <input className={inputCls} inputMode="tel" value={v.celtisMoneyNumber} onChange={(e) => set("celtisMoneyNumber", e.target.value)} placeholder="+229 ..." />
        <input className={`${inputCls} mt-2`} value={v.celtisMoneyAccountName} onChange={(e) => set("celtisMoneyAccountName", e.target.value)} placeholder="Nom affiché du compte" />
      </div>
      <div>
        <label className={labelCls}>Instructions affichées aux utilisateurs</label>
        <textarea className={inputCls} rows={3} value={v.paymentInstructions} onChange={(e) => set("paymentInstructions", e.target.value)} placeholder="Ex : validation sous 24 h." />
      </div>
      <div>
        <label className={labelCls}>Durée d'un paiement Premium (jours)</label>
        <input className={inputCls} type="number" min={1} max={366} value={v.premiumDurationDays} onChange={(e) => set("premiumDurationDays", Number(e.target.value))} />
      </div>

      <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Enregistrement..." : "Enregistrer"}</Button>
      {msg && <p className={`text-sm ${msg.ok ? "text-ivoire-dim" : "text-red-400"}`}>{msg.text}</p>}
    </form>
  );
}
