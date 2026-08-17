import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NameForm } from "@/components/settings/name-form";
import { PasswordForm } from "@/components/settings/password-form";
import { ThemeSection } from "@/components/settings/theme-section";
import { DashboardLayoutForm } from "@/components/settings/dashboard-layout-form";
import { parseDashboardPrefs } from "@/lib/dashboard-prefs";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const isPremium = subscription?.plan === "PREMIUM";
  const prefs = parseDashboardPrefs(user?.dashboardPrefs);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Paramètres</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Mon compte</h1>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-ivoire">{user?.name ?? "Sans pseudo"}</p>
            <p className="text-sm text-ivoire-dim">{user?.email}</p>
          </div>
          {isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>Gratuit</Badge>}
        </div>
        {!isPremium && (
          <a href="/#tarifs">
            <Button size="sm">Passer Premium</Button>
          </a>
        )}
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg text-ivoire">Pseudo</p>
        <NameForm initialName={user?.name ?? ""} />
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg text-ivoire">Mot de passe</p>
        <PasswordForm hasPassword={Boolean(user?.password)} />
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg text-ivoire">Apparence</p>
        <ThemeSection />
      </Card>

      <Card>
        <p className="mb-1 font-display text-lg text-ivoire">Disposition du tableau de bord</p>
        <p className="mb-4 text-sm text-ivoire-dim">
          Choisissez les sections que vous voulez voir sur votre tableau de bord.
        </p>
        <DashboardLayoutForm initialPrefs={prefs} />
      </Card>
    </div>
  );
}
