import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Receipt, Bell, LifeBuoy, ChevronRight } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { PasswordForm, SessionsCard, DangerZone } from "@/components/app/account-forms";
import { ThemePreference } from "@/components/app/theme-preference";
import { requireUser } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Paramètres" };

const SHORTCUTS = [
  { href: "/premium", label: "Abonnement Premium", icon: Crown },
  { href: "/achats", label: "Mes achats et paiements", icon: Receipt },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/support", label: "Contacter le support", icon: LifeBuoy },
];

export default async function SettingsPage() {
  const session = await requireUser("/parametres");

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-6">
      <SectionHeading eyebrow="Ton compte" title="Paramètres" />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">{session.email}</CardTitle>
            <CardDescription>
              {session.plan === "premium"
                ? `Premium actif${session.premiumUntil ? ` jusqu'au ${formatDate(session.premiumUntil)}` : ""}`
                : "Compte gratuit"}
            </CardDescription>
          </div>
          {session.plan === "premium" ? (
            <Badge tone="or">
              <Crown size={11} /> Premium
            </Badge>
          ) : (
            <Link href="/premium">
              <Badge tone="outline">Passer Premium</Badge>
            </Link>
          )}
        </div>
      </Card>

      <ThemePreference />

      <Card className="p-0">
        <ul>
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.href}>
              <Link
                href={shortcut.href}
                className="flex items-center gap-3.5 border-b border-ivoire/6 px-4 py-3.5 text-sm text-ivoire-dim transition-colors last:border-0 hover:bg-ivoire/4 hover:text-ivoire"
              >
                <shortcut.icon size={17} className="shrink-0 text-or" strokeWidth={1.6} />
                <span className="flex-1">{shortcut.label}</span>
                <ChevronRight size={15} className="shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <PasswordForm />
      <SessionsCard />
      <DangerZone email={session.email} />
    </PageTransition>
  );
}
