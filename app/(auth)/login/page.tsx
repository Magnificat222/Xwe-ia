"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { AuthCard, FormField } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";

function LoginForm() {
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
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (result?.error) {
      setServerError("E-mail ou mot de passe incorrect.");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/dashboard");
  };

  return (
    <AuthCard
      title="Connexion"
      subtitle="Retrouvez vos missions et votre progression."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-or hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-ivoire-dim hover:text-or">
            Mot de passe oublié ?
          </Link>
        </div>
        {serverError && (
          <p className="text-sm text-red-400">{serverError}</p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Se connecter
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
