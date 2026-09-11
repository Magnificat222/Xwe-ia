import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Download, Lock, BookOpen, ArrowLeft } from "lucide-react";

export default async function EbooksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/ebooks");

  const isAdmin = session.user.role === "ADMIN";
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  const isPremium = subscription?.plan === "PREMIUM";
  const hasAccess = isPremium || isAdmin;

  const ebooks = await prisma.ebook.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
      >
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Bibliothèque</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Ebooks</h1>
        <p className="mt-2 text-ivoire-dim">
          Des guides pratiques téléchargeables pour aller plus loin, à votre rythme.
        </p>
      </div>

      {!hasAccess && (
        <div className="mb-8 rounded-xl border border-or/20 bg-or/5 p-5">
          <div className="flex items-center gap-2 text-or">
            <Lock size={16} />
            <p className="text-sm font-medium">Réservé aux membres Premium</p>
          </div>
          <p className="mt-1 text-sm text-ivoire-dim">
            Passez Premium pour télécharger tous les ebooks de la bibliothèque.
          </p>
          <a href="/#tarifs" className="mt-4 inline-block">
            <Button size="sm">Voir les offres Premium</Button>
          </a>
        </div>
      )}

      <div className="space-y-4">
        {ebooks.map((ebook) => (
          <div
            key={ebook.id}
            className="flex flex-col gap-4 rounded-xl border border-ivoire/10 bg-noir-elevated/40 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-or/10 text-or">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="font-display text-lg text-ivoire">{ebook.title}</h2>
                <p className="mt-1 text-sm text-ivoire-dim">{ebook.description}</p>
                {ebook.pageCount && (
                  <p className="mt-1 text-xs text-ivoire-dim">{ebook.pageCount} pages</p>
                )}
              </div>
            </div>

            {hasAccess || !ebook.isPremium ? (
              <a href={`/api/ebooks/${ebook.slug}/download`} className="shrink-0">
                <Button size="sm">
                  <Download size={15} /> Télécharger
                </Button>
              </a>
            ) : (
              <Button size="sm" disabled className="shrink-0 opacity-50">
                <Lock size={15} /> Premium requis
              </Button>
            )}
          </div>
        ))}

        {ebooks.length === 0 && (
          <p className="text-sm text-ivoire-dim">Aucun ebook disponible pour le moment.</p>
        )}
      </div>
    </main>
  );
}
