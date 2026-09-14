"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Écran d'erreur de l'application.
 *
 * Sans ce fichier, Next.js affiche en production un texte brut du type
 * « une exception côté serveur s'est produite… Résumé : 2478666328 »,
 * incompréhensible pour un visiteur.
 *
 * On explique, on propose une sortie, et on n'expose aucun détail technique :
 * seul le digest est montré, car il permet de retrouver la trace exacte dans
 * les journaux de l'hébergeur.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur applicative :", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-braise/15 text-braise">
          <AlertTriangle size={26} strokeWidth={1.6} />
        </span>

        <h1 className="mt-6 text-2xl font-semibold text-ivoire">Une erreur est survenue</h1>

        <p className="mt-3 text-sm leading-relaxed text-ivoire-dim">
          Le problème vient de nous, pas de toi. Réessaie dans un instant : si cela persiste,
          contacte-nous depuis la page Support.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RotateCcw size={16} /> Réessayer
          </Button>
          <Link href="/">
            <Button variant="secondary" className="w-full sm:w-auto">
              <Home size={16} /> Retour à l&apos;accueil
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-[0.7rem] text-ivoire-dim/70">
            Référence : {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
