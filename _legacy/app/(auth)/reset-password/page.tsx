"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { AuthCard, FormField } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  if (!token || !email) {
    return (
      <p className="text-sm text-red-400">
        Lien de réinitialisation invalide. Merci de refaire une demande depuis{" "}
        <Link href="/forgot-password" className="text-or hover:underline">
          la page mot de passe oublié
        </Link>
        .
      </p>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password: data.password }),
    });

    if (!response.ok) {
      const body = await response.json();
      setServerError(body.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Nouveau mot de passe"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe pour votre compte."
      footer={
        <Link href="/login" className="text-or hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
