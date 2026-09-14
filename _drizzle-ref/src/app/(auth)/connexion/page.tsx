import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/forms";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const { suite } = await searchParams;
  const safeSuite = suite?.startsWith("/") && !suite.startsWith("//") ? suite : null;
  const registerHref = safeSuite
    ? `/inscription?suite=${encodeURIComponent(safeSuite)}`
    : "/inscription";

  return (
    <AuthCard
      title="Bon retour"
      subtitle="Reprends ton parcours là où tu t'étais arrêté."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href={registerHref} className="text-or transition-colors hover:text-or-vif">
            Créer un compte
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
