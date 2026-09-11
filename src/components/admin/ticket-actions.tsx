"use client";

import { useTransition } from "react";
import { MessageSquareReply, CheckCircle2, RotateCcw } from "lucide-react";
import { setTicketStatusAction } from "@/lib/actions/admin";

export function TicketStatusActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();

  const actions = [
    { value: "pending" as const, icon: MessageSquareReply, label: "Marquer comme répondu" },
    { value: "closed" as const, icon: CheckCircle2, label: "Fermer la demande" },
    { value: "open" as const, icon: RotateCcw, label: "Rouvrir la demande" },
  ];

  return (
    <div className="flex items-center justify-end gap-0.5">
      {actions.map((action) => (
        <button
          key={action.value}
          type="button"
          disabled={pending || status === action.value}
          aria-label={action.label}
          title={action.label}
          onClick={() => start(() => setTicketStatusAction(id, action.value))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ivoire-dim transition-colors hover:bg-or/10 hover:text-or disabled:opacity-30"
        >
          <action.icon size={15} />
        </button>
      ))}
    </div>
  );
}
