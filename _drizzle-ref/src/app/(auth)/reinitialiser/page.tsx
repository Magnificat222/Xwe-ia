import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/forms";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard
        title="Lien invalide"
        subtitle="Ce lien de réinitialisation est incomplet ou a expiré."
        footer={
          <Link href="/mot-de-passe-oublie" className="text-or hover:text-or-vif">
            Demander un nouveau lien
          </Link>
        }
      >
        <p className="text-sm text-ivoire-dim">
          Les liens de réinitialisation sont valables une heure et à usage unique.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Nouveau mot de passe" subtitle="Choisis un mot de passe que tu n'utilises pas ailleurs.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
