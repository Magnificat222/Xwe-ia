import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "gold" | "violet";
}

const toneStyles = {
  default: "bg-ivoire/8 text-ivoire-dim border-ivoire/15",
  gold: "bg-or/12 text-or-vif border-or/30",
  violet: "bg-violet-soft/40 text-ivoire border-violet-soft",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
