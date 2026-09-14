import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  tone?: "default" | "or" | "braise" | "feuillage";
  padded?: boolean;
}

const tones = {
  default: "border-ivoire/10",
  or: "border-or/30 bg-or/[0.04]",
  braise: "border-braise/30 bg-braise/[0.05]",
  feuillage: "border-feuillage/30 bg-feuillage/[0.05]",
};

export function Card({
  className,
  interactive,
  tone = "default",
  padded = true,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border bg-noir-elevated transition-all duration-300",
        tones[tone],
        padded && "p-5 sm:p-6",
        interactive &&
          "hover:-translate-y-1 hover:border-or/40 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.8)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-lg text-ivoire", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1.5 text-sm leading-relaxed text-ivoire-dim", className)} {...props} />;
}
