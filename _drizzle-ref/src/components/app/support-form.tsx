"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { createTicketAction, replyTicketAction } from "@/lib/actions/app";
import type { ActionState } from "@/lib/actions/auth";

export function SupportForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createTicketAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardTitle className="text-base">Écrire au support</CardTitle>
      <CardDescription>On répond en général sous 24 à 48 heures ouvrées.</CardDescription>

      <form ref={formRef} action={action} className="mt-5 space-y-5">
        {state.success && <Alert tone="succes">{state.success}</Alert>}

        {!defaultEmail && (
          <Input
            type="email"
            name="email"
            label="Ton adresse e-mail"
            required
            error={state.fieldErrors?.email}
          />
        )}

        <Input
          name="subject"
          label="Sujet"
          placeholder="Ex : Je n'arrive pas à valider une mission"
          required
          error={state.fieldErrors?.subject}
        />

        <Textarea
          name="message"
          label="Ton message"
          rows={6}
          placeholder="Décris ce que tu as fait, ce que tu attendais et ce qui s'est passé."
          required
          error={state.fieldErrors?.message}
        />

        <Button type="submit" loading={pending} icon={<Send size={16} />}>
          Envoyer ma demande
        </Button>
      </form>
    </Card>
  );
}

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  return (
    <Card>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!body.trim()) return;
          start(async () => {
            await replyTicketAction(ticketId, body);
            setBody("");
          });
        }}
        className="space-y-4"
      >
        <Textarea
          label="Ta réponse"
          rows={4}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
        />
        <Button type="submit" loading={pending} disabled={!body.trim()} icon={<Send size={15} />}>
          Envoyer
        </Button>
      </form>
    </Card>
  );
}
