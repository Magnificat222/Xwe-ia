import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Conditions d'utilisation — Xwé IA" };

export default function ConditionsPage() {
  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
          <ArrowLeft size={15} /> Retour à l'accueil
        </Link>

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Conditions</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Conditions d'utilisation</h1>
        <p className="mt-2 text-sm text-ivoire-dim">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ivoire-dim">
          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">1. Acceptation</h2>
            <p>
              En créant un compte sur Xwé IA, vous acceptez les présentes conditions
              d'utilisation. Si vous n'êtes pas d'accord, merci de ne pas utiliser le service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">2. Le service</h2>
            <p>
              Xwé IA propose des missions guidées, des prompts, des parcours d'apprentissage,
              une arène de quiz et un salon d'échange, avec un accès Gratuit et un accès
              Premium payant. Certaines fonctionnalités s'appuient sur des services
              d'intelligence artificielle tiers pour générer du contenu (questions de quiz,
              réponses dans le Salon Premium).
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">3. Votre compte</h2>
            <p>
              Vous êtes responsable de la confidentialité de votre mot de passe et de toute
              activité effectuée depuis votre compte. Merci de nous signaler immédiatement
              toute utilisation non autorisée.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">4. Abonnement Premium</h2>
            <p>
              L'abonnement Premium est facturé mensuellement via notre prestataire de paiement
              KKiaPay, au tarif affiché au moment de la souscription. L'abonnement donne accès
              au contenu Premium tant qu'il reste actif.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">5. Bon usage du Salon Premium</h2>
            <p>
              Le Salon Premium est un espace partagé entre plusieurs membres. Les propos
              injurieux, le harcèlement, le partage d'images inappropriées ou tout contenu
              illégal ne sont pas tolérés et peuvent entraîner une suspension du compte.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">6. Contenu généré par IA</h2>
            <p>
              Les questions de quiz et certaines réponses du Salon Premium sont générées par
              une intelligence artificielle. Bien que nous cherchions à en garantir la
              qualité, ce contenu peut occasionnellement contenir des erreurs — gardez un
              esprit critique.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">7. Résiliation</h2>
            <p>
              Vous pouvez cesser d'utiliser le service à tout moment. Nous pouvons suspendre
              ou résilier un compte en cas de violation manifeste des présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ivoire">8. Contact</h2>
            <p>
              Pour toute question sur ces conditions, écrivez-nous via la{" "}
              <Link href="/contact" className="text-or hover:underline">page Contact</Link>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
