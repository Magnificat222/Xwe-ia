"use client";

import { useActionState, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import {
  updatePathwayPriceAction,
  updatePremiumPriceAction,
} from "@/lib/actions/admin-commerce";
import type { ActionState } from "@/lib/actions/auth";
import { formatXof } from "@/lib/utils";

const EMPTY: ActionState = {};

/**
 * Les deux formulaires n'affichent le bouton d'enregistrement que lorsque le
 * prix a réellement changé : cela évite les écritures inutiles dans
 * l'historique des prix, qui doit rester lisible.
 */

export function PriceForm({
  pathwayId,
  currentPrice,
}: {
  pathwayId: string;
  currentPrice: number;
}) {
  const [state, action, pending] = useActionState(updatePathwayPriceAction, EMPTY);
  const [price, setPrice] = useState(String(currentPrice));
  const { push } = useToast();

  useEffect(() => {
    if (state.success) push(state.success, "succes");
    if (state.error) push(state.error, "erreur");
  }, [state, push]);

  const changed = Number(price) !== currentPrice;

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
      <input type="hidden" name="pathwayId" value={pathwayId} />
      <Input
        label="Prix (FCFA)"
        name="priceXof"
        type="number"
        min={0}
        step={100}
        inputMode="numeric"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={state.fieldErrors?.priceXof}
      />
      <Input
        label="Motif"
        name="reason"
        placeholder="Ex : alignement sur la valeur du livrable"
      />
      <Button type="submit" size="sm" loading={pending} disabled={!changed} icon={<Save size={14} />}>
        Enregistrer
      </Button>
      {changed && (
        <p className="text-xs text-or sm:col-span-3">
          {formatXof(currentPrice)} → {formatXof(Number(price) || 0)}
        </p>
      )}
    </form>
  );
}

export function PremiumPriceForm({ currentPrice }: { currentPrice: number }) {
  const [state, action, pending] = useActionState(updatePremiumPriceAction, EMPTY);
  const [price, setPrice] = useState(String(currentPrice));
  const { push } = useToast();

  useEffect(() => {
    if (state.success) push(state.success, "succes");
    if (state.error) push(state.error, "erreur");
  }, [state, push]);

  const changed = Number(price) !== currentPrice;

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
      <Input
        label="Prix mensuel (FCFA)"
        name="premiumPriceXof"
        type="number"
        min={0}
        step={100}
        inputMode="numeric"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={state.fieldErrors?.premiumPriceXof}
      />
      <Input label="Motif" name="reason" placeholder="Ex : ajout de nouveaux avantages" />
      <Button type="submit" size="sm" loading={pending} disabled={!changed} icon={<Save size={14} />}>
        Enregistrer
      </Button>
      {changed && (
        <p className="text-xs text-or sm:col-span-3">
          {formatXof(currentPrice)} → {formatXof(Number(price) || 0)} par mois
        </p>
      )}
    </form>
  );
}
