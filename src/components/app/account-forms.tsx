"use client";

import { useActionState, useState, useTransition } from "react";
import { Save, KeyRound, LogOut, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Textarea, Select } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import {
  updateProfileAction,
} from "@/lib/actions/app";
import {
  changePasswordAction,
  deleteAccountAction,
  revokeOtherSessionsAction,
  type ActionState,
} from "@/lib/actions/auth";

const DOMAINS = [
  "Entrepreneuriat",
  "Commerce",
  "Études",
  "Marketing / communication",
  "Technologie",
  "Artisanat / création",
  "Santé",
  "Agriculture",
  "Fonction publique",
  "Autre",
];

export function ProfileForm({
  defaults,
}: {
  defaults: { displayName: string; bio: string; domain: string; country: string };
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProfileAction, {});

  return (
    <Card>
      <CardTitle className="text-base">Informations publiques</CardTitle>
      <CardDescription>C'est ce que voient les autres membres.</CardDescription>

      <form action={action} className="mt-5 space-y-5">
        {state.success && <Alert tone="succes">{state.success}</Alert>}

        <Input
          name="displayName"
          label="Nom d'affichage"
          defaultValue={defaults.displayName}
          required
          error={state.fieldErrors?.displayName}
        />

        <Textarea
          name="bio"
          label="Présentation"
          rows={4}
          defaultValue={defaults.bio}
          hint="Quelques lignes sur toi et ce que tu construis."
          error={state.fieldErrors?.bio}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select name="domain" label="Domaine" defaultValue={defaults.domain}>
            <option value="">Non précisé</option>
            {DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </Select>
          <Input name="country" label="Pays" defaultValue={defaults.country} placeholder="Bénin" />
        </div>

        <Button type="submit" loading={pending} icon={<Save size={16} />}>
          Enregistrer
        </Button>
      </form>
    </Card>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changePasswordAction, {});

  return (
    <Card>
      <CardTitle className="text-base">Mot de passe</CardTitle>
      <CardDescription>Choisis un mot de passe d'au moins 8 caractères.</CardDescription>

      <form action={action} className="mt-5 space-y-5">
        {state.error && <Alert tone="erreur">{state.error}</Alert>}
        {state.success && <Alert tone="succes">{state.success}</Alert>}

        <Input
          type="password"
          name="currentPassword"
          label="Mot de passe actuel"
          required
          error={state.fieldErrors?.currentPassword}
        />
        <Input
          type="password"
          name="password"
          label="Nouveau mot de passe"
          required
          error={state.fieldErrors?.password}
        />
        <Input
          type="password"
          name="confirmPassword"
          label="Confirmer le nouveau mot de passe"
          required
          error={state.fieldErrors?.confirmPassword}
        />

        <Button type="submit" variant="secondary" loading={pending} icon={<KeyRound size={16} />}>
          Changer mon mot de passe
        </Button>
      </form>
    </Card>
  );
}

export function SessionsCard() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    revokeOtherSessionsAction,
    {},
  );

  return (
    <Card>
      <CardTitle className="text-base">Sessions actives</CardTitle>
      <CardDescription>
        Tu t'es connecté sur un appareil que tu n'utilises plus ? Déconnecte-le d'ici.
      </CardDescription>
      <form action={action} className="mt-4">
        {state.success && (
          <div className="mb-4">
            <Alert tone="succes">{state.success}</Alert>
          </div>
        )}
        <Button type="submit" variant="secondary" loading={pending} icon={<LogOut size={16} />}>
          Déconnecter les autres appareils
        </Button>
      </form>
    </Card>
  );
}

export function DangerZone({ email }: { email: string }) {
  const [confirmation, setConfirmation] = useState("");
  const [pending, start] = useTransition();
  const matches = confirmation.trim().toLowerCase() === email.toLowerCase();

  return (
    <Card tone="braise">
      <CardTitle className="flex items-center gap-2 text-base">
        <ShieldAlert size={17} className="text-erreur" /> Supprimer mon compte
      </CardTitle>
      <CardDescription>
        Cette action est définitive. Tes parcours, résultats et documents seront supprimés.
      </CardDescription>

      <div className="mt-5 space-y-4">
        <Input
          label="Saisis ton adresse e-mail pour confirmer"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={email}
          autoComplete="off"
        />
        <Button
          variant="braise"
          disabled={!matches}
          loading={pending}
          icon={<Trash2 size={16} />}
          onClick={() => {
            if (!confirm("Supprimer définitivement ton compte Xwé IA ?")) return;
            start(() => deleteAccountAction());
          }}
        >
          Supprimer définitivement
        </Button>
      </div>
    </Card>
  );
}
