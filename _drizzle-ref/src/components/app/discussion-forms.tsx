"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Send, ThumbsUp, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Select } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import {
  createDiscussionAction,
  replyAction,
  toggleReactionAction,
  reportAction,
} from "@/lib/actions/app";
import type { ActionState } from "@/lib/actions/auth";

export function NewDiscussionForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createDiscussionAction,
    {},
  );

  return (
    <Card>
      <form action={action} className="space-y-5">
        {state.error && <Alert tone="erreur">{state.error}</Alert>}

        <Input
          name="title"
          label="Titre"
          placeholder="Ex : Comment structurer mon offre de service ?"
          required
          error={state.fieldErrors?.title}
        />

        <Select name="categoryId" label="Catégorie">
          <option value="">Aucune catégorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Textarea
          name="body"
          label="Ton message"
          rows={8}
          placeholder="Explique ton contexte, ce que tu as déjà essayé, et ce sur quoi tu bloques."
          required
          error={state.fieldErrors?.body}
        />

        <Button type="submit" size="lg" loading={pending} icon={<Send size={16} />}>
          Publier le sujet
        </Button>
      </form>
    </Card>
  );
}

export function ReplyForm({ discussionId, locked }: { discussionId: string; locked: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(replyAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const { push } = useToast();

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      push(state.success, "succes");
    }
  }, [state, push]);

  if (locked) {
    return (
      <Card>
        <p className="text-center text-sm text-ivoire-dim">
          Cette discussion est fermée aux nouvelles réponses.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form ref={formRef} action={action} className="space-y-4">
        <input type="hidden" name="discussionId" value={discussionId} />
        {state.error && <Alert tone="erreur">{state.error}</Alert>}
        <Textarea
          name="body"
          label="Ta réponse"
          rows={5}
          placeholder="Partage ton expérience ou ta solution…"
          required
        />
        <Button type="submit" loading={pending} icon={<Send size={15} />}>
          Répondre
        </Button>
      </form>
    </Card>
  );
}

export function ReactionButton({
  entityType,
  entityId,
  count,
  reacted,
}: {
  entityType: string;
  entityId: string;
  count: number;
  reacted: boolean;
}) {
  const [state, setState] = useState({ count, reacted });
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={state.reacted}
      onClick={() =>
        start(async () => {
          const result = await toggleReactionAction(entityType, entityId);
          setState((prev) => ({
            reacted: result.reacted,
            count: prev.count + (result.reacted ? 1 : -1),
          }));
        })
      }
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
        state.reacted
          ? "border-or/50 bg-or/10 text-or"
          : "border-ivoire/12 text-ivoire-dim hover:border-or/30 hover:text-ivoire"
      }`}
    >
      <ThumbsUp size={13} fill={state.reacted ? "currentColor" : "none"} />
      {state.count > 0 ? state.count : "Utile"}
    </button>
  );
}

export function ReportButton({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [pending, start] = useTransition();
  const { push } = useToast();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const reason = prompt("Pourquoi signales-tu ce contenu ?");
        if (!reason) return;
        start(async () => {
          await reportAction(entityType, entityId, reason);
          push("Signalement transmis à l'équipe de modération.", "succes");
        });
      }}
      aria-label="Signaler ce contenu"
      className="rounded-lg p-1.5 text-ivoire-faint transition-colors hover:bg-erreur/10 hover:text-erreur"
    >
      <Flag size={13} />
    </button>
  );
}
