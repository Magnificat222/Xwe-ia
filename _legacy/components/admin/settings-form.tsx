"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/lib/actions/settings";

export function SettingsForm({
  initialPrice,
  initialSelfServe,
}: {
  initialPrice: number;
  initialSelfServe: boolean;
}) {
  const [price, setPrice] = useState(initialPrice);
  const [selfServe, setSelfServe] = useState(initialSelfServe);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateSiteSettings({ premiumPriceXof: price, selfServePremiumEnabled: selfServe });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-6">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Prix Premium (FCFA / mois)
        </label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
        <p className="mt-1.5 text-xs text-ivoire-dim">
          Utilisé à la fois sur la carte tarifs et pour le montant réellement facturé via KKiaPay.
        </p>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-ivoire">
        <input
          type="checkbox"
          checked={selfServe}
          onChange={(e) => setSelfServe(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-braise"
        />
        <span>
          Paiement Premium ouvert à tous
          <span className="mt-0.5 block text-xs font-normal text-ivoire-dim">
            Décochez pour passer en accès sur invitation : le bouton de paiement disparaît du site,
            et vous seule décidez qui devient Premium depuis Admin → Utilisateurs. Utile pendant une
            phase de test.
          </span>
        </span>
      </label>

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Enregistrement..." : status === "saved" ? "Enregistré" : "Enregistrer"}
      </Button>
    </form>
  );
}
