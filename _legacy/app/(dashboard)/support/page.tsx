import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SupportChat } from "@/components/dashboard/support-chat";
import { ArrowLeft } from "lucide-react";

// La Discussion est ouverte à tous les utilisateurs connectés — gratuit par conception.
// Seuls les non-connectés sont redirigés vers /login.
export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/support");

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
      >
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Communauté</p>
        <h1 className="mt-2 font-display text-2xl text-ivoire">
          Discussion
        </h1>
        <p className="mt-1 text-sm text-ivoire-dim">
          Échange avec la communauté Xwé IA — pose tes questions, partage tes avancées, aide les autres.
        </p>
      </div>
      <SupportChat />
    </div>
  );
}
