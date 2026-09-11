"use client";

import { Input, Textarea, Select, Checkbox } from "@/components/ui/field";
import { ICON_NAMES } from "@/lib/icons";

interface BenefitRow {
  id: string;
  label: string;
  description: string;
  icon: string;
  position: number;
  isActive: boolean;
}

export function BenefitFields({ benefit }: { benefit?: BenefitRow }) {
  return (
    <div className="space-y-4">
      {benefit && <input type="hidden" name="id" value={benefit.id} />}

      <Input
        label="Intitulé"
        name="label"
        required
        defaultValue={benefit?.label}
        placeholder="Ex : Tous les parcours inclus"
      />

      <Textarea
        label="Précision"
        name="description"
        rows={2}
        defaultValue={benefit?.description}
        placeholder="Une phrase qui explique concrètement l'avantage."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Icône" name="icon" defaultValue={benefit?.icon ?? "Sparkles"}>
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Input
          label="Ordre d'affichage"
          name="position"
          type="number"
          min={0}
          inputMode="numeric"
          defaultValue={benefit?.position ?? 0}
        />
      </div>

      <Checkbox
        name="isActive"
        defaultChecked={benefit?.isActive ?? true}
        label="Afficher cet avantage sur la page Premium"
      />
    </div>
  );
}
