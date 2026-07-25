"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { AuthCard, FormField } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    // TODO: POST to /api/auth/forgot-password (issue reset token, send email)
    console.log("forgot-password", data);
  };

  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Recevez un lien de réinitialisation par e-mail."
      footer={
        <Link href="/login" className="text-or hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      {isSubmitSuccessful ? (
        <p className="text-sm text-ivoire">
          Si un compte existe pour cette adresse, un e-mail vient d'être envoyé.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="E-mail"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Envoyer le lien
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
