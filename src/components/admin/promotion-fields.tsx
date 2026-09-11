"use client";

import { useState } from "react";
import { Input, Select, Checkbox } from "@/components/ui/field";

interface PromotionRow {
  id: string;
  label: string;
  code: string | null;
  discountType: string;
  discountValue: number;
  startsAt: Date | null;
  endsAt: Date | null;
  maxRedemptions: number | null;
  isActive: boolean;
  appliesToPremium: boolean;
  pathwayId: string | null;
}

/** Formate une date pour un `<input type="datetime-local">`. */
function toLocalInput(date: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function PromotionFields({
  pathways,
  promotion,
}: {
  pathways: { id: string; title: string }[];
  promotion?: PromotionRow;
}) {
  const [premium, setPremium] = useState(promotion?.appliesToPremium ?? false);
  const [type, setType] = useState(promotion?.discountType ?? "percent");

  const valueLabel =
    type === "percent"
      ? "Pourcentage de remise"
      : type === "amount"
        ? "Montant retiré (FCFA)"
        : "Prix imposé (FCFA)";

  return (
    <div className="space-y-4">
      {promotion && <input type="hidden" name="id" value={promotion.id} />}

      <Input
        label="Intitulé"
        name="label"
        required
        defaultValue={promotion?.label}
        placeholder="Ex : Lancement de la rentrée"
        hint="Visible par l'utilisateur à côté du prix barré."
      />

      <Input
        label="Code promo"
        name="code"
        defaultValue={promotion?.code ?? ""}
        placeholder="RENTREE25"
        hint="Facultatif. Laisse vide pour une remise appliquée automatiquement."
      />

      <Checkbox
        name="appliesToPremium"
        defaultChecked={promotion?.appliesToPremium}
        onChange={(e) => setPremium(e.target.checked)}
        label="Cette promotion porte sur l'abonnement Premium"
      />

      {!premium && (
        <Select
          label="Parcours concerné"
          name="pathwayId"
          defaultValue={promotion?.pathwayId ?? ""}
          hint="Vide = tous les parcours payants."
        >
          <option value="">Tout le catalogue payant</option>
          {pathways.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </Select>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Type de remise"
          name="discountType"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="percent">Pourcentage</option>
          <option value="amount">Montant retiré</option>
          <option value="fixed_price">Prix fixe</option>
        </Select>
        <Input
          label={valueLabel}
          name="discountValue"
          type="number"
          min={0}
          max={type === "percent" ? 100 : undefined}
          step={type === "percent" ? 1 : 100}
          inputMode="numeric"
          required
          defaultValue={promotion?.discountValue}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Début"
          name="startsAt"
          type="datetime-local"
          defaultValue={toLocalInput(promotion?.startsAt ?? null)}
          hint="Vide = tout de suite."
        />
        <Input
          label="Fin"
          name="endsAt"
          type="datetime-local"
          defaultValue={toLocalInput(promotion?.endsAt ?? null)}
          hint="Vide = sans limite."
        />
      </div>

      <Input
        label="Nombre maximum d'utilisations"
        name="maxRedemptions"
        type="number"
        min={1}
        inputMode="numeric"
        defaultValue={promotion?.maxRedemptions ?? ""}
        hint="Vide = illimité."
      />

      <Checkbox
        name="isActive"
        defaultChecked={promotion?.isActive ?? true}
        label="Promotion active"
      />
    </div>
  );
}
