"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { AuthCard, FormField } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
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

    router.push("/login?registered=1");
  };

  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Choisissez un objectif et commencez votre première mission."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/login" className="text-or hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Nom"
          type="text"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormField
          label="E-mail"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Mot de passe"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />
        {serverError && (
          <p className="text-sm text-red-400">{serverError}</p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Créer mon compte
        </Button>
      </form>
    </AuthCard>
  );
}
