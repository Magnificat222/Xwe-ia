import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn, initials } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden {...props} />;
}

export function Lisere({ className }: { className?: string }) {
  return <div className={cn("lisere", className)} aria-hidden />;
}

/** Suréclat + titre : le marqueur éditorial de la marque. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "text-center")}>
        {eyebrow && (
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-or">{eyebrow}</p>
        )}
        <h2 className="mt-2.5 font-display text-2xl leading-tight text-ivoire sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-ivoire-dim sm:text-base">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-ivoire/15 bg-noir-elevated/50 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-or/10 text-or">
          {icon}
        </div>
      )}
      <p className="font-display text-base text-ivoire">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-ivoire-dim">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-or/25 bg-noir-raised font-display text-ivoire",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function Stat({
  label,
  value,
  icon,
  tone = "or",
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "or" | "braise" | "feuillage";
  hint?: string;
}) {
  const tones = {
    or: "bg-or/10 text-or",
    braise: "bg-braise/12 text-braise-vif",
    feuillage: "bg-feuillage/12 text-feuillage-vif",
  };
  return (
    <div className="flex items-center gap-4 rounded-card border border-ivoire/10 bg-noir-elevated p-4 transition-colors hover:border-or/25">
      {icon && (
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="font-display text-xl text-ivoire">{value}</p>
        <p className="truncate text-xs text-ivoire-dim">{label}</p>
        {hint && <p className="truncate text-[0.7rem] text-ivoire-faint">{hint}</p>}
      </div>
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: "info" | "succes" | "alerte" | "erreur";
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const tones = {
    info: "border-info/35 bg-info/8 text-ivoire",
    succes: "border-feuillage/40 bg-feuillage/10 text-ivoire",
    alerte: "border-or/40 bg-or/8 text-ivoire",
    erreur: "border-erreur/40 bg-erreur/10 text-ivoire",
  };
  return (
    <div
      role="status"
      className={cn("flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm", tones[tone])}
    >
      <div>
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-ivoire-dim">{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-xs text-ivoire-dim">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-ivoire-faint">/</span>}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-or">
              {item.label}
            </Link>
          ) : (
            <span className="text-ivoire">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
