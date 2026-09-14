import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-ivoire/10 bg-noir-elevated p-6",
        "transition-colors duration-200 hover:border-or/30",
        className
      )}
      {...props}
    />
  );
}
