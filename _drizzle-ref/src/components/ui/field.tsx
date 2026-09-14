"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const baseControl =
  "w-full rounded-xl border border-ivoire/15 bg-noir px-4 py-3 text-sm text-ivoire placeholder:text-ivoire-faint outline-none transition-all duration-200 focus:border-or/60 focus:bg-noir-soft focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-or)_12%,transparent)] disabled:opacity-50";

export function Field({
  label,
  error,
  hint,
  required,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("block", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivoire-dim"
        >
          {label}
          {required && <span className="ml-1 text-braise">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ivoire-faint">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-erreur">
          <AlertCircle size={13} aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, type, className, id, required, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={inputId}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && show ? "text" : type}
          aria-invalid={error ? true : undefined}
          className={cn(baseControl, isPassword && "pr-12", error && "border-erreur/60", className)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ivoire-faint transition-colors hover:text-ivoire"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </Field>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, required, ...props },
  ref,
) {
  const generatedId = useId();
  const areaId = id ?? generatedId;
  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={areaId}>
      <textarea
        ref={ref}
        id={areaId}
        rows={5}
        aria-invalid={error ? true : undefined}
        className={cn(baseControl, "resize-y leading-relaxed", error && "border-erreur/60", className)}
        {...props}
      />
    </Field>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, id, required, children, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={selectId}>
      <select
        ref={ref}
        id={selectId}
        className={cn(baseControl, "cursor-pointer appearance-none pr-10", className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23b8ab96' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
        }}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
});

export function Checkbox({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  const id = useId();
  return (
    <label
      htmlFor={props.id ?? id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-ivoire/10 bg-noir-elevated p-3.5 text-sm text-ivoire transition-colors hover:border-or/30 has-[:checked]:border-or/50 has-[:checked]:bg-or/[0.06]",
        className,
      )}
    >
      <input
        id={props.id ?? id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-or)]"
        {...props}
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

export function RadioOption({
  label,
  description,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: string }) {
  const id = useId();
  return (
    <label
      htmlFor={props.id ?? id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-ivoire/10 bg-noir-elevated p-3.5 text-sm text-ivoire transition-all duration-200 hover:border-or/30 has-[:checked]:border-or/60 has-[:checked]:bg-or/[0.07]",
        className,
      )}
    >
      <input
        id={props.id ?? id}
        type="radio"
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-or)]"
        {...props}
      />
      <span>
        <span className="block leading-snug">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ivoire-dim">{description}</span>}
      </span>
    </label>
  );
}
