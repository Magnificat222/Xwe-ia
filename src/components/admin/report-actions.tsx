"use client";

import { useTransition } from "react";
import { Eye, Check, X } from "lucide-react";
import { resolveReportAction } from "@/lib/actions/admin";

export function ReportActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();

  const actions = [
    { value: "reviewing" as const, icon: Eye, label: "Marquer en cours", tone: "text-or" },
    { value: "resolved" as const, icon: Check, label: "Marquer traité", tone: "text-feuillage-vif" },
    { value: "dismissed" as const, icon: X, label: "Rejeter", tone: "text-ivoire-faint" },
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
          onClick={() => start(() => resolveReportAction(id, action.value))}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-ivoire/8 disabled:opacity-30 ${action.tone}`}
        >
          <action.icon size={15} />
        </button>
      ))}
    </div>
  );
}
