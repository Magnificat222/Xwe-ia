"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-noir px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-lg text-ivoire">
          Xwé <span className="text-or">IA</span>
        </Link>
        <div className="rounded-card border border-ivoire/10 bg-noir-soft p-8">
          <h1 className="font-display text-2xl text-ivoire">{title}</h1>
          <p className="mt-1.5 text-sm text-ivoire-dim">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-6 text-center text-sm text-ivoire-dim">{footer}</p>}
      </div>
    </main>
  );
}

export function FormField({
  label,
  error,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
        {label}
      </span>
      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3.5 py-2.5 text-sm text-ivoire outline-none transition-colors focus:border-or"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ivoire-dim hover:text-ivoire"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
