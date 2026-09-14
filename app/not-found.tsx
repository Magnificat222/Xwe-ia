import Link from "next/link";
import { Compass, Home, Route } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-or/12 text-or">
          <Compass size={26} strokeWidth={1.6} />
        </span>

        <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-or">
          Erreur 404
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-ivoire">Cette page n&apos;existe pas</h1>

        <p className="mt-3 text-sm leading-relaxed text-ivoire-dim">
          Le lien est peut-être ancien, ou la page a été déplacée.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home size={16} /> Accueil
            </Button>
          </Link>
          <Link href="/parcours">
            <Button variant="secondary" className="w-full sm:w-auto">
              <Route size={16} /> Voir les parcours
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
