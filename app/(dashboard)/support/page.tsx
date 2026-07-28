import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { SupportChat } from "@/components/dashboard/support-chat";
import { Lock, ArrowLeft } from "lucide-react";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/support");

  const isAdmin = session.user.role === "ADMIN";

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  const isPremium = subscription?.plan === "PREMIUM";

  if (!isPremium && !isAdmin) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Lock className="mx-auto mb-4 text-or" size={32} />
        <h1 className="font-display text-2xl text-ivoire">Salon réservé aux membres Premium</h1>
        <p className="mt-3 text-ivoire-dim">
          Passez Premium pour échanger avec les autres membres, obtenir des
          réponses instantanées de l'assistant IA, et bénéficier d'un suivi
          personnalisé de l'équipe Xwé IA.
        </p>
        <a href="/#tarifs" className="mt-6 inline-block">
          <Button size="lg">Voir les offres Premium</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
      >
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Salon Premium</p>
        <h1 className="mt-2 font-display text-2xl text-ivoire">
          Discuter avec la communauté et l'équipe
        </h1>
      </div>
      <SupportChat />
    </div>
  );
}
