import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "or" | "braise" | "feuillage" | "erreur" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  default: "bg-ivoire/8 text-ivoire-dim border-ivoire/15",
  or: "bg-or/12 text-or-vif border-or/35",
  braise: "bg-braise/15 text-braise-vif border-braise/35",
  feuillage: "bg-feuillage/15 text-feuillage-vif border-feuillage/35",
  erreur: "bg-erreur/12 text-erreur border-erreur/35",
  outline: "bg-transparent text-ivoire-dim border-ivoire/20",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
