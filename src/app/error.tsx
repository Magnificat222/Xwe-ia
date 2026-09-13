"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

/**
 * Écran d'erreur de l'application.
 *
 * Sans ce fichier, Next affiche un texte brut avec un simple identifiant :
 * incompréhensible pour un visiteur. On explique ce qui se passe, on propose
 * une action, et on n'expose jamais le détail technique — seul le digest,
 * qui permet de retrouver la trace dans les journaux du serveur.
 */
export default function ErrorPage({
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
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-braise/12 text-braise-vif">
          <AlertTriangle size={26} strokeWidth={1.6} />
        </span>

        <h1 className="mt-6 font-display text-2xl text-ivoire">Une erreur est survenue</h1>

        <p className="mt-3 text-sm leading-relaxed text-ivoire-dim">
          Le problème vient de nous, pas de toi. Réessaie dans un instant : si cela persiste,
          écris-nous depuis la page Support.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-or px-5 text-sm font-medium text-noir transition-opacity hover:opacity-90"
          >
            <RotateCcw size={16} /> Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ivoire/12 px-5 text-sm text-ivoire transition-colors hover:border-or/30"
          >
            <Home size={16} /> Retour à l'accueil
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-[0.7rem] text-ivoire-faint">
            Référence : {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
