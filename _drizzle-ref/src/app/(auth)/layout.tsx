import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/brand";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect(session.onboarded ? "/tableau-de-bord" : "/bienvenue");

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="halo-braise pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-ivoire-dim transition-colors hover:text-or"
        >
          <ArrowLeft size={15} /> Accueil
        </Link>
      </header>

      <main id="contenu" className="flex flex-1 items-center justify-center px-5 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
