"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "braise" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-or text-noir font-semibold shadow-[0_2px_16px_-6px_var(--color-or)] hover:bg-or-vif hover:shadow-[0_6px_24px_-8px_var(--color-or)] active:translate-y-px",
  braise:
    "bg-braise text-ivoire font-semibold shadow-[0_2px_16px_-6px_var(--color-braise)] hover:bg-braise-vif active:translate-y-px",
  secondary:
    "bg-noir-elevated text-ivoire border border-ivoire/15 hover:border-or/45 hover:bg-noir-raised",
  outline:
    "bg-transparent text-ivoire border border-or/35 hover:border-or hover:bg-or/8",
  ghost: "bg-transparent text-ivoire-dim hover:bg-ivoire/6 hover:text-ivoire",
  danger: "bg-erreur/12 text-erreur border border-erreur/35 hover:bg-erreur/20",
};

const sizes: Record<Size, string> = {
  // min-h-11 = 44px : cible tactile confortable sur mobile
  sm: "text-sm px-3.5 min-h-9 rounded-lg gap-1.5",
  md: "text-sm px-5 min-h-11 rounded-xl gap-2",
  lg: "text-base px-7 min-h-13 py-3.5 rounded-xl gap-2.5",
  icon: "h-11 w-11 rounded-xl justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    iconRight,
    fullWidth,
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2 focus-visible:ring-offset-noir",
        "disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
});
