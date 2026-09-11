"use client";

import { Input, Checkbox } from "@/components/ui/field";

interface PaymentNumberRow {
  id: string;
  label: string;
  number: string;
  holderName: string | null;
  isPrimary: boolean;
  isActive: boolean;
  position: number;
}

export function PaymentNumberFields({ number }: { number?: PaymentNumberRow }) {
  return (
    <div className="space-y-4">
      {number && <input type="hidden" name="id" value={number.id} />}

      <Input
        label="Intitulé"
        name="label"
        required
        defaultValue={number?.label ?? "MTN MoMo"}
        placeholder="MTN MoMo"
        hint="Ce que l'utilisateur lit au-dessus du numéro."
      />

      <Input
        label="Numéro"
        name="number"
        required
        inputMode="tel"
        defaultValue={number?.number}
        placeholder="+229 01 51 36 76 76"
      />

      <Input
        label="Nom du titulaire"
        name="holderName"
        defaultValue={number?.holderName ?? ""}
        placeholder="Nom affiché lors du transfert"
        hint="Rassure l'utilisateur : il doit reconnaître ce nom sur son téléphone."
      />

      <Input
        label="Ordre d'affichage"
        name="position"
        type="number"
        min={0}
        inputMode="numeric"
        defaultValue={number?.position ?? 0}
      />

      <Checkbox
        name="isPrimary"
        defaultChecked={number?.isPrimary}
        label="Numéro principal (proposé en premier)"
      />
      <Checkbox name="isActive" defaultChecked={number?.isActive ?? true} label="Numéro actif" />
    </div>
  );
}
