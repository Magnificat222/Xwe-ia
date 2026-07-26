import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const isPremium = subscription?.plan === "PREMIUM";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Profil</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Mon compte</h1>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-ivoire">{user?.name ?? "Sans nom"}</p>
            <p className="text-sm text-ivoire-dim">{user?.email}</p>
          </div>
          {isPremium ? (
            <Badge tone="gold">Premium</Badge>
          ) : (
            <Badge>Gratuit</Badge>
          )}
        </div>
        {!isPremium && (
          <Link href="/#tarifs">
            <Button size="sm">Passer Premium</Button>
          </Link>
        )}
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg text-ivoire">Informations</p>
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
              Nom
            </label>
            <input
              defaultValue={user?.name ?? ""}
              className="w-full rounded-lg border border-ivoire/15 bg-noir px-3.5 py-2.5 text-sm text-ivoire outline-none focus:border-or"
            />
          </div>
          <Button type="submit" size="sm">Enregistrer</Button>
        </form>
      </Card>
    </div>
  );
}
