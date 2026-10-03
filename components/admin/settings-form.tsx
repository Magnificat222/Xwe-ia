"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/lib/actions/settings";

export function SettingsForm({ initialPrice }: { initialPrice: number }) {
  const [price, setPrice] = useState(initialPrice);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateSiteSettings({ premiumPriceXof: price });
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
          min={1}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
        <p className="mt-1.5 text-xs text-ivoire-dim">
          Utilisé sur la carte tarifs et comme montant demandé pour les paiements MTN Mobile Money / Celtis Money.
          Le paiement Kkiapay est suspendu (« bientôt disponible »).
        </p>
      </div>

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Enregistrement..." : status === "saved" ? "Enregistré" : "Enregistrer"}
      </Button>
    </form>
  );
}
