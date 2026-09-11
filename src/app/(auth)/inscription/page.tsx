import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/forms";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Créer mon compte" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const { suite } = await searchParams;
  // On conserve l'intention d'origine en passant d'un formulaire à l'autre.
  const safeSuite = suite?.startsWith("/") && !suite.startsWith("//") ? suite : null;
  const loginHref = safeSuite ? `/connexion?suite=${encodeURIComponent(safeSuite)}` : "/connexion";

  return (
    <AuthCard
      title="Créer ton compte"
      subtitle="Deux minutes pour démarrer ton premier objectif. C'est gratuit."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href={loginHref} className="text-or transition-colors hover:text-or-vif">
            Se connecter
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}
