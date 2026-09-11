"use client";

import { useActionState } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Textarea, Checkbox } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { saveSettingsAction } from "@/lib/actions/admin";
import type { ActionState } from "@/lib/actions/auth";

export function SettingsForm({
  defaults,
}: {
  defaults: {
    premiumPriceXof: number;
    selfServePremium: boolean;
    supportEmail: string;
    announcement: string;
    maintenanceMode: boolean;
  };
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveSettingsAction, {});

  return (
    <form action={action} className="space-y-5">
      {state.success && <Alert tone="succes">{state.success}</Alert>}
      {state.error && <Alert tone="erreur">{state.error}</Alert>}

      <Card>
        <CardTitle className="text-base">Monétisation</CardTitle>
        <CardDescription>Le prix Premium s'affiche sur les pages Tarifs et Premium.</CardDescription>
        <div className="mt-5 space-y-5">
          <Input
            type="number"
            name="premiumPriceXof"
            label="Prix de l'abonnement Premium (FCFA / mois)"
            defaultValue={defaults.premiumPriceXof}
            min={0}
            error={state.fieldErrors?.premiumPriceXof}
          />
          <Checkbox
            name="selfServePremium"
            label="Autoriser les membres à s'abonner eux-mêmes"
            defaultChecked={defaults.selfServePremium}
          />
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base">Communication</CardTitle>
        <div className="mt-5 space-y-5">
          <Input
            type="email"
            name="supportEmail"
            label="Adresse e-mail du support"
            defaultValue={defaults.supportEmail}
          />
          <Textarea
            name="announcement"
            label="Bandeau d'annonce"
            rows={3}
            defaultValue={defaults.announcement}
            hint="Laisse vide pour ne rien afficher."
          />
        </div>
      </Card>

      <Card tone="braise">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle size={17} className="text-braise-vif" /> Maintenance
        </CardTitle>
        <CardDescription>
          En mode maintenance, seuls les membres de l'équipe peuvent accéder au site.
        </CardDescription>
        <div className="mt-5">
          <Checkbox
            name="maintenanceMode"
            label="Activer le mode maintenance"
            defaultChecked={defaults.maintenanceMode}
          />
        </div>
      </Card>

      <Button type="submit" size="lg" loading={pending} icon={<Save size={16} />}>
        Enregistrer les paramètres
      </Button>
    </form>
  );
}
