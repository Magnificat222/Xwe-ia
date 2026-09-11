"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Pin, Lock, Trash2, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const ICONS = {
  publish: { on: Eye, off: EyeOff },
  pin: { on: Pin, off: Pin },
  lock: { on: Lock, off: Lock },
  check: { on: Check, off: Check },
} as const;

/** Bouton d'action serveur sans formulaire, avec état de chargement. */
export function ToggleButton({
  action,
  active,
  variant = "publish",
  label,
  confirm: confirmMessage,
  tone = "or",
}: {
  action: () => Promise<void>;
  active: boolean;
  variant?: keyof typeof ICONS;
  label: string;
  confirm?: string;
  tone?: "or" | "braise" | "erreur";
}) {
  const [pending, start] = useTransition();
  const Icon = active ? ICONS[variant].on : ICONS[variant].off;

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => {
        if (confirmMessage && !confirm(confirmMessage)) return;
        start(() => action());
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-40",
        active
          ? tone === "braise"
            ? "text-braise-vif hover:bg-braise/10"
            : "text-or hover:bg-or/10"
          : "text-ivoire-faint hover:bg-ivoire/8 hover:text-ivoire",
      )}
    >
      <Icon size={15} fill={active && variant === "pin" ? "currentColor" : "none"} />
    </button>
  );
}

export function DeleteButton({
  action,
  label,
  confirm: confirmMessage,
}: {
  action: () => Promise<void>;
  label: string;
  confirm: string;
}) {
  const [pending, start] = useTransition();
  const { push } = useToast();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={label}
      title={label}
      onClick={() => {
        if (!confirm(confirmMessage)) return;
        start(async () => {
          await action();
          push("Élément supprimé.", "succes");
        });
      }}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-ivoire-faint transition-colors hover:bg-erreur/10 hover:text-erreur disabled:opacity-40"
    >
      <Trash2 size={15} />
    </button>
  );
}
