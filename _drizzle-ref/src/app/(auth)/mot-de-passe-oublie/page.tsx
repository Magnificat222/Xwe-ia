import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forms";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Indique ton adresse : nous t'envoyons un lien pour en choisir un nouveau."
      footer={
        <Link href="/connexion" className="text-or transition-colors hover:text-or-vif">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
