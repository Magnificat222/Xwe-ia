"use client";

import { useActionState, useState } from "react";
import { Send, Megaphone, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Textarea, RadioOption } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { broadcastNotificationAction } from "@/lib/actions/admin";
import type { ActionState } from "@/lib/actions/auth";

export function BroadcastForm({
  totalUsers,
  premiumUsers,
}: {
  totalUsers: number;
  premiumUsers: number;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    broadcastNotificationAction,
    {},
  );
  const [audience, setAudience] = useState("all");

  const recipients = audience === "premium" ? premiumUsers : totalUsers;

  return (
    <form action={action}>
      <Card>
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone size={17} className="text-or" /> Nouvelle annonce
        </CardTitle>
        <CardDescription>
          Le message apparaît dans le fil de notifications des destinataires.
        </CardDescription>

        <div className="mt-5 space-y-5">
          {state.success && <Alert tone="succes">{state.success}</Alert>}
          {state.error && <Alert tone="erreur">{state.error}</Alert>}

          <Input
            name="title"
            label="Titre"
            placeholder="Ex : Trois nouveaux parcours disponibles"
            required
            error={state.fieldErrors?.title}
          />

          <Textarea
            name="body"
            label="Message"
            rows={4}
            placeholder="Sois bref et concret."
            required
            error={state.fieldErrors?.body}
          />

          <Input
            name="link"
            label="Lien (facultatif)"
            placeholder="/parcours"
            hint="Chemin interne uniquement, par exemple /parcours ou /premium."
          />

          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-ivoire-dim">
              Destinataires
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <RadioOption
                name="audience"
                value="all"
                label={
                  <span className="flex items-center gap-2">
                    <Users size={14} /> Tous les membres
                  </span>
                }
                description={`${totalUsers} destinataires`}
                checked={audience === "all"}
                onChange={() => setAudience("all")}
              />
              <RadioOption
                name="audience"
                value="premium"
                label={
                  <span className="flex items-center gap-2">
                    <Crown size={14} /> Abonnés Premium
                  </span>
                }
                description={`${premiumUsers} destinataires`}
                checked={audience === "premium"}
                onChange={() => setAudience("premium")}
              />
            </div>
          </fieldset>

          <Button
            type="submit"
            size="lg"
            loading={pending}
            icon={<Send size={16} />}
            disabled={recipients === 0}
          >
            Envoyer à {recipients} membre{recipients > 1 ? "s" : ""}
          </Button>
        </div>
      </Card>
    </form>
  );
}
