"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";

type Mode = "login" | "register";

// Xwé IA brand colors, extracted from the logo.
const BURNT_ORANGE = "#b33709";
const DEEP_GREEN = "#062c15";

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
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire/40">
        {label}
      </span>
      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          className="w-full rounded-lg border border-ivoire/10 bg-noir-soft px-4 py-3 text-sm text-ivoire placeholder:text-ivoire/25 outline-none transition-all duration-200 focus:border-or/50 focus:bg-noir-elevated focus:shadow-[0_0_0_3px_rgba(201,162,75,0.08)]"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ivoire/30 hover:text-ivoire/70"
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="mt-1.5 block text-xs text-red-400/80">{error}</span>}
    </label>
  );
}

function SocialRow() {
  return (
    <div className="flex justify-center gap-3">
      <button
        type="button"
        disabled
        title="Bientôt disponible"
        className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-ivoire/10 bg-noir-soft text-ivoire/25"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      </button>
      <button
        type="button"
        disabled
        title="Bientôt disponible"
        className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-ivoire/10 bg-noir-soft text-ivoire/25"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12 0c-6.6 0-12 5.4-12 12 0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.6 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C20.6 21.8 24 17.3 24 12c0-6.6-5.4-12-12-12z" />
        </svg>
      </button>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-ivoire/25">
      <span className="h-px flex-1 bg-ivoire/10" />
      ou
      <span className="h-px flex-1 bg-ivoire/10" />
    </div>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const result = await signIn("credentials", { ...data, redirect: false });
    if (result?.error) {
      setServerError("E-mail ou mot de passe incorrect.");
      return;
    }
    router.push(searchParams.get("callbackUrl") ?? "/dashboard");
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 font-display text-2xl text-ivoire">Bon retour</h1>
      <p className="mb-6 text-sm text-ivoire/50">
        Reprenez vos missions là où vous les avez laissées.
      </p>
      <SocialRow />
      <div className="my-5">
        <Divider />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="E-mail" type="email" placeholder="votre@email.com" error={errors.email?.message} {...register("email")} />
        <FormField label="Mot de passe" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-ivoire/40 hover:text-or">
            Mot de passe oublié ?
          </Link>
        </div>
        {serverError && <p className="text-sm text-red-400/80">{serverError}</p>}
        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ivoire/40 md:hidden">
        Pas encore de compte ?{" "}
        <button type="button" onClick={onSwitch} className="font-medium text-or hover:text-or-vif">
          Créer un compte
        </button>
      </p>
    </div>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setServerError(error ?? "Une erreur est survenue.");
      return;
    }

    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 font-display text-2xl text-ivoire">Créer un compte</h1>
      <p className="mb-6 text-sm text-ivoire/50">
        Rejoignez Xwé IA et commencez votre première mission.
      </p>
      <SocialRow />
      <div className="my-5">
        <Divider />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Pseudo" type="text" placeholder="Comment vous appeler ?" error={errors.name?.message} {...register("name")} />
        <FormField label="E-mail" type="email" placeholder="votre@email.com" error={errors.email?.message} {...register("email")} />
        <FormField label="Mot de passe" type="password" placeholder="8 caractères minimum" error={errors.password?.message} {...register("password")} />
        {serverError && <p className="text-sm text-red-400/80">{serverError}</p>}
        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ivoire/40 md:hidden">
        Déjà un compte ?{" "}
        <button type="button" onClick={onSwitch} className="font-medium text-or hover:text-or-vif">
          Se connecter
        </button>
      </p>
    </div>
  );
}

function OverlayPanel({ mode, onSwitch }: { mode: Mode; onSwitch: () => void }) {
  return (
    <div
      className="absolute inset-y-0 left-0 hidden w-1/2 items-center overflow-hidden p-10 transition-transform duration-700 ease-in-out md:flex"
      style={{
        transform: mode === "login" ? "translateX(100%)" : "translateX(0%)",
        background: `linear-gradient(135deg, ${BURNT_ORANGE} 0%, ${DEEP_GREEN} 100%)`,
      }}
    >
      {/* Geometric watermark inspired by the logo's circuit / diamond motifs */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <svg className="h-full w-full" viewBox="0 0 400 600" fill="none">
          <path d="M200 60 L330 200 L200 340 L70 200 Z" stroke="#f5e6c8" strokeWidth="1" />
          <path d="M200 105 L285 200 L200 295 L115 200 Z" stroke="#f5e6c8" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="55" stroke="#f5e6c8" strokeWidth="0.5" />
          <line x1="60" y1="420" x2="150" y2="420" stroke="#f5e6c8" strokeWidth="0.5" />
          <line x1="150" y1="420" x2="150" y2="470" stroke="#f5e6c8" strokeWidth="0.5" />
          <line x1="150" y1="470" x2="250" y2="470" stroke="#f5e6c8" strokeWidth="0.5" />
          <circle cx="150" cy="470" r="3" fill="#f5e6c8" />
          <circle cx="250" cy="470" r="3" fill="#f5e6c8" />
        </svg>
      </div>

      <div className="relative z-10 max-w-xs text-ivoire">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ivoire/70">
          L&apos;IA orientée objectifs
        </p>
        <h2 className="font-display text-3xl leading-tight">
          Transformez vos objectifs en <span className="italic">résultats</span>
        </h2>

        <div className="mt-8 space-y-3">
          {[
            "59 missions guidées par catégorie",
            "47 prompts premium par métier",
            "12 parcours complets d'apprentissage",
          ].map((line, i) => (
            <div key={line} className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ivoire/15">
                <span className="text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-sm text-ivoire/85">{line}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button
            type="button"
            variant="secondary"
            className="rounded-full border-ivoire/40 bg-transparent text-ivoire hover:bg-ivoire/10"
            onClick={onSwitch}
          >
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AuthSlider({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const toggle = () => setMode((m) => (m === "login" ? "register" : "login"));

  return (
    <main className="flex min-h-screen items-center justify-center bg-noir px-4 py-8">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-ivoire/10 bg-noir shadow-2xl shadow-black/50">
        {/* Logo, top-left */}
        <Link href="/" className="absolute left-8 top-8 z-20 flex items-center gap-2 md:left-10 md:top-10">
          <img src="/logo-xwe-ia.png" alt="Xwé IA" className="h-9 w-9 rounded-full" />
          <span className="font-display text-lg tracking-tight text-ivoire">
            Xwé <span className="text-or">IA</span>
          </span>
        </Link>

        {/* Mobile pill tabs */}
        <div className="flex justify-center gap-1 border-b border-ivoire/10 p-4 pt-20 md:hidden">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-5 py-2 text-sm transition-colors ${
              mode === "login" ? "bg-or text-noir" : "text-ivoire-dim"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-full px-5 py-2 text-sm transition-colors ${
              mode === "register" ? "bg-or text-noir" : "text-ivoire-dim"
            }`}
          >
            Inscription
          </button>
        </div>

        <div className="relative grid min-h-[600px] md:grid-cols-2">
          <div className="flex items-center justify-center p-8 pt-8 md:p-12 md:pt-24">
            {mode === "login" ? <LoginForm onSwitch={toggle} /> : <div className="hidden md:block" />}
            {mode === "register" && (
              <div className="md:hidden">
                <RegisterForm onSwitch={toggle} />
              </div>
            )}
          </div>
          <div className="hidden items-center justify-center p-8 md:flex md:p-12">
            {mode === "register" ? <RegisterForm onSwitch={toggle} /> : null}
          </div>

          <OverlayPanel mode={mode} onSwitch={toggle} />
        </div>
      </div>
    </main>
  );
}
