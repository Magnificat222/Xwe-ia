import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { SupportChat } from "@/components/dashboard/support-chat";
import { Lock } from "lucide-react";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/support");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const isPremium = subscription?.plan === "PREMIUM";

  if (!isPremium) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Lock className="mx-auto mb-4 text-or" size={32} />
        <h1 className="font-display text-2xl text-ivoire">Chat réservé aux membres Premium</h1>
        <p className="mt-3 text-ivoire-dim">
          Passez Premium pour discuter directement avec l'équipe Xwé IA et
          obtenir un suivi personnalisé sur vos missions.
        </p>
        <Link href="/#tarifs" className="mt-6 inline-block">
          <Button size="lg">Voir les offres Premium</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Support Premium</p>
        <h1 className="mt-2 font-display text-2xl text-ivoire">Discuter avec l'équipe</h1>
      </div>
      <SupportChat />
    </div>
  );
}
