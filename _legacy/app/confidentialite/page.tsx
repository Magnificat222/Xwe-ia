import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Confidentialité — Xwé IA" };

export default function ConfidentialitePage() {
  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
          <ArrowLeft size={15} /> Retour à l'accueil
        </Link>

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Confidentialité</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Politique de confidentialité</h1>
        <p className="mt-2 text-sm text-ivoire-dim">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ivoire-dim">
          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">1. Qui nous sommes</h2>
            <p>
              Xwé IA est une plateforme d'apprentissage de l'intelligence artificielle appliquée
              au business, au marketing, aux études et à la productivité. Cette politique explique
              quelles données nous collectons, pourquoi, et comment vous pouvez les contrôler.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">2. Données que nous collectons</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Informations de compte : pseudo, adresse e-mail, mot de passe (stocké de façon chiffrée, jamais en clair).</li>
              <li>Photo de profil, si vous choisissez d'en ajouter une.</li>
              <li>Progression : missions terminées, résultats de quiz, favoris, historique de consultation.</li>
              <li>Messages envoyés dans le Salon Premium, y compris les images que vous y partagez.</li>
              <li>Informations de paiement traitées par notre prestataire KKiaPay pour l'abonnement Premium — nous ne stockons jamais vos coordonnées bancaires nous-mêmes.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">3. Comment nous utilisons ces données</h2>
            <p>
              Vos données servent à faire fonctionner votre compte, suivre votre progression,
              personnaliser votre expérience (thème, police, disposition du tableau de bord), et
              vous permettre d'échanger dans le Salon Premium. Le contenu de vos messages dans le
              Salon Premium peut être transmis à un service d'intelligence artificielle tiers
              (Google Gemini) pour générer une réponse automatique.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">4. Partage des données</h2>
            <p>
              Nous ne vendons jamais vos données. Elles sont partagées uniquement avec les
              prestataires nécessaires au fonctionnement du service : hébergement de la base de
              données, envoi d'e-mails transactionnels, traitement des paiements Premium, et
              génération de réponses IA dans le Salon Premium.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">5. Vos droits</h2>
            <p>
              Vous pouvez à tout moment modifier votre pseudo, votre mot de passe et votre photo
              de profil depuis vos paramètres. Pour toute demande de suppression de compte ou
              d'export de vos données, contactez-nous depuis{" "}
              <Link href="/contact" className="text-or hover:underline">la page Contact</Link>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">6. Nous contacter</h2>
            <p>
              Pour toute question sur cette politique ou sur vos données, écrivez-nous via la{" "}
              <Link href="/contact" className="text-or hover:underline">page Contact</Link>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
